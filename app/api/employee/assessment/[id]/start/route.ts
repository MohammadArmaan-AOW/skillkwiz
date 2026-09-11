import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireEmployee } from "@/lib/auth/requireEmployee";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import AssessmentAttempt from "@/lib/db/assessmentAttemptSchema";

function errorResponse(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

/* -------------------------------------------------------------------------- */
/*                    POST /api/employee/assessment/[id]/start                */
/* -------------------------------------------------------------------------- */

export async function POST(
    _request: NextRequest,
    context: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        /* ------------------------------------------------------------------ */
        /* Employee Authentication                                             */
        /* ------------------------------------------------------------------ */

        const employee = await requireEmployee();

        if (!employee) {
            return errorResponse("Employee authentication required.", 401);
        }

        /* ------------------------------------------------------------------ */
        /* Assessment ID                                                        */
        /* ------------------------------------------------------------------ */

        const { id } = await context.params;

        if (!mongoose.isValidObjectId(id)) {
            return errorResponse("Invalid assessment ID.", 400);
        }

        await connectDB();

        /* ------------------------------------------------------------------ */
        /* Fetch Assessment                                                     */
        /* ------------------------------------------------------------------ */

        const assessment = await Assessment.findOne({
            _id: id,
            "assignedEmployees.employeeId": employee._id,
        }).lean();

        if (!assessment) {
            return errorResponse(
                "Assessment not found or not assigned to you.",
                404,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Assessment Status                                                    */
        /* ------------------------------------------------------------------ */

        if (assessment.status !== "published") {
            return errorResponse(
                "This assessment is not currently available.",
                403,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Find Employee Assignment                                             */
        /* ------------------------------------------------------------------ */

        const assignment = assessment.assignedEmployees.find(
            (item) => item.employeeId.toString() === employee._id.toString(),
        );

        if (!assignment) {
            return errorResponse(
                "This assessment is not assigned to you.",
                403,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Existing Assignment Status                                           */
        /* ------------------------------------------------------------------ */

        if (assignment.status === "completed") {
            return errorResponse(
                "You have already completed this assessment.",
                409,
            );
        }

        if (assignment.status === "expired") {
            return errorResponse(
                "This assessment assignment has expired.",
                410,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Server Time Check                                                    */
        /* ------------------------------------------------------------------ */

        const now = new Date();

        const startAt = new Date(assessment.timing.startAt);
        const endAt = new Date(assessment.timing.endAt);

        /* Before assessment starts */

        if (now < startAt) {
            return NextResponse.json(
                {
                    success: false,
                    code: "NOT_AVAILABLE",
                    message: "This assessment has not started yet.",
                    availability: {
                        status: "not-started",
                        startAt,
                        endAt,
                    },
                },
                { status: 403 },
            );
        }

        /* After assessment ends */

        if (now >= endAt) {
            return NextResponse.json(
                {
                    success: false,
                    code: "EXPIRED",
                    message: "This assessment is no longer available.",
                    availability: {
                        status: "expired",
                        startAt,
                        endAt,
                    },
                },
                { status: 410 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Existing In-Progress Attempt                                        */
        /* ------------------------------------------------------------------ */

        const existingAttempt = await AssessmentAttempt.findOne({
            assessmentId: assessment._id,
            employeeId: employee._id,
            status: "in-progress",
        }).lean();

        if (existingAttempt) {
            /*
             * If an existing timed attempt has already expired,
             * do not allow it to continue.
             */

            if (
                assessment.timer.enabled &&
                existingAttempt.expiresAt &&
                now >= new Date(existingAttempt.expiresAt)
            ) {
                await AssessmentAttempt.updateOne(
                    {
                        _id: existingAttempt._id,
                        status: "in-progress",
                    },
                    {
                        $set: {
                            status: "expired",
                            submittedAt: now,
                            submissionType: "auto",
                        },
                    },
                );

                await Assessment.updateOne(
                    {
                        _id: assessment._id,
                        "assignedEmployees.employeeId": employee._id,
                    },
                    {
                        $set: {
                            "assignedEmployees.$.status": "expired",
                            "assignedEmployees.$.submittedAt": now,
                        },
                    },
                );

                return errorResponse(
                    "Your assessment attempt has expired.",
                    410,
                );
            }

            /*
             * Employee already started this assessment.
             *
             * Do not create another attempt.
             */

            return NextResponse.json(
                {
                    success: true,
                    message: "Assessment attempt already in progress.",
                    attempt: {
                        id: existingAttempt._id,
                        status: existingAttempt.status,
                        startedAt: existingAttempt.startedAt,
                        expiresAt: existingAttempt.expiresAt ?? null,
                    },
                },
                { status: 200 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Calculate Attempt Deadline                                           */
        /* ------------------------------------------------------------------ */

        const durationMilliseconds =
            assessment.timing.durationMinutes * 60 * 1000;

        /*
         * Timer is only started when the employee
         * explicitly starts the assessment.
         *
         * The effective deadline is the earlier of:
         *
         * startedAt + duration
         * OR
         * scheduled assessment endAt
         */

        const calculatedExpiry = new Date(now.getTime() + durationMilliseconds);

        const expiresAt = calculatedExpiry < endAt ? calculatedExpiry : endAt;

        /*
         * For a non-timed assessment, there is no
         * attempt countdown.
         */

        const attemptExpiresAt = assessment.timer.enabled
            ? expiresAt
            : undefined;

        /* ------------------------------------------------------------------ */
        /* Create Attempt                                                       */
        /* ------------------------------------------------------------------ */

        const attempt = await AssessmentAttempt.create({
            assessmentId: assessment._id,
            employeeId: employee._id,
            status: "in-progress",
            startedAt: now,
            ...(attemptExpiresAt
                ? {
                      expiresAt: attemptExpiresAt,
                  }
                : {}),
            answers: [],
            tabChangeCount: 0,
        });

        /* ------------------------------------------------------------------ */
        /* Update Assignment                                                    */
        /* ------------------------------------------------------------------ */

        await Assessment.updateOne(
            {
                _id: assessment._id,
                "assignedEmployees.employeeId": employee._id,
            },
            {
                $set: {
                    "assignedEmployees.$.status": "in-progress",
                    "assignedEmployees.$.startedAt": now,
                },
            },
        );

        /* ------------------------------------------------------------------ */
        /* Employee-Safe Questions                                              */
        /* ------------------------------------------------------------------ */

        const questions = assessment.questions.map((question) => {
            if (question.type !== "mcq") {
                return question;
            }

            return {
                ...question,
                options: question.options?.map((option) => ({
                    optionId: option.optionId,
                    text: option.text,
                })),
            };
        });

        /* ------------------------------------------------------------------ */
        /* Response                                                             */
        /* ------------------------------------------------------------------ */

        return NextResponse.json(
            {
                success: true,
                message: "Assessment started successfully.",

                assessment: {
                    id: assessment._id,
                    title: assessment.title,
                    instructions: assessment.instructions,
                    skills: assessment.skills,
                    timer: assessment.timer,
                    security: assessment.security,
                    questions,
                },

                attempt: {
                    id: attempt._id,
                    status: attempt.status,
                    startedAt: attempt.startedAt,
                    expiresAt: attempt.expiresAt ?? null,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/employee/assessment/[id]/start error:", error);

        return errorResponse("Failed to start assessment.", 500);
    }
}
