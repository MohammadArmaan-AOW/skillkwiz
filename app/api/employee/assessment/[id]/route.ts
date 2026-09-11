import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";

import { requireEmployee } from "@/lib/auth/requireEmployee";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";

type AvailabilityStatus =
    | "not-started"
    | "available"
    | "in-progress"
    | "completed"
    | "expired"
    | "closed"
    | "unavailable";

function errorResponse(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

export async function GET(
    _request: NextRequest,
    context: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        const employee = await requireEmployee();

        if (!employee) {
            return errorResponse("Employee authentication required.", 401);
        }

        const { id } = await context.params;

        if (!mongoose.isValidObjectId(id)) {
            return errorResponse("Invalid assessment ID.", 400);
        }

        await connectDB();

        const assessment = await Assessment.findOne({
            _id: id,
            "assignedEmployees.employeeId": employee._id,
        }).lean();

        if (!assessment) {
            return errorResponse("Assessment not found.", 404);
        }

        const assignment = assessment.assignedEmployees.find(
            (item) =>
                item.employeeId.toString() === employee._id.toString(),
        );

        if (!assignment) {
            return errorResponse(
                "You are not assigned to this assessment.",
                403,
            );
        }

        const now = new Date();

        const startAt = new Date(assessment.timing.startAt);
        const endAt = new Date(assessment.timing.endAt);

        /*
         * ---------------------------------------------------------
         * Completed
         * ---------------------------------------------------------
         */

        if (assignment.status === "completed") {
            return NextResponse.json({
                success: true,
                availability: {
                    status: "completed" satisfies AvailabilityStatus,
                    startAt: assessment.timing.startAt,
                    endAt: assessment.timing.endAt,
                },
                assessment: sanitizeAssessment(assessment),
            });
        }

        /*
         * ---------------------------------------------------------
         * In-progress
         * ---------------------------------------------------------
         *
         * Once an employee has started an assessment, the attempt
         * is responsible for the actual timer/expiry.
         *
         * However, the assessment window itself still cannot be
         * exceeded.
         */

        if (assignment.status === "in-progress") {
            if (now >= endAt) {
                return NextResponse.json({
                    success: true,
                    availability: {
                        status: "expired" satisfies AvailabilityStatus,
                        startAt: assessment.timing.startAt,
                        endAt: assessment.timing.endAt,
                    },
                    assessment: sanitizeAssessment(assessment),
                });
            }

            return NextResponse.json({
                success: true,
                availability: {
                    status: "in-progress" satisfies AvailabilityStatus,
                    startAt: assessment.timing.startAt,
                    endAt: assessment.timing.endAt,
                },
                assessment: sanitizeAssessment(assessment),
            });
        }

        /*
         * ---------------------------------------------------------
         * Assessment status
         * ---------------------------------------------------------
         */

        if (
            assessment.status === "closed" ||
            assessment.status === "archived"
        ) {
            return NextResponse.json({
                success: true,
                availability: {
                    status: "closed" satisfies AvailabilityStatus,
                    startAt: assessment.timing.startAt,
                    endAt: assessment.timing.endAt,
                },
                assessment: sanitizeAssessment(assessment),
            });
        }

        /*
         * ---------------------------------------------------------
         * Assessment must be published
         * ---------------------------------------------------------
         */

        if (assessment.status !== "published") {
            return NextResponse.json({
                success: true,
                availability: {
                    status: "unavailable" satisfies AvailabilityStatus,
                    startAt: assessment.timing.startAt,
                    endAt: assessment.timing.endAt,
                },
                assessment: sanitizeAssessment(assessment),
            });
        }

        /*
         * ---------------------------------------------------------
         * Before start time
         * ---------------------------------------------------------
         */

        if (now < startAt) {
            return NextResponse.json({
                success: true,
                availability: {
                    status: "not-started" satisfies AvailabilityStatus,
                    startAt: assessment.timing.startAt,
                    endAt: assessment.timing.endAt,
                },
                assessment: sanitizeAssessment(assessment),
            });
        }

        /*
         * ---------------------------------------------------------
         * After end time
         * ---------------------------------------------------------
         */

        if (now >= endAt) {
            return NextResponse.json({
                success: true,
                availability: {
                    status: "expired" satisfies AvailabilityStatus,
                    startAt: assessment.timing.startAt,
                    endAt: assessment.timing.endAt,
                },
                assessment: sanitizeAssessment(assessment),
            });
        }

        /*
         * ---------------------------------------------------------
         * Currently available
         * ---------------------------------------------------------
         */

        return NextResponse.json({
            success: true,
            availability: {
                status: "available" satisfies AvailabilityStatus,
                startAt: assessment.timing.startAt,
                endAt: assessment.timing.endAt,
            },
            assessment: sanitizeAssessment(assessment),
        });
    } catch (error) {
        console.error("GET employee assessment error:", error);

        return errorResponse(
            "Failed to fetch assessment.",
            500,
        );
    }
}

/* -------------------------------------------------------------------------- */
/*                       Employee-safe assessment                             */
/* -------------------------------------------------------------------------- */

function sanitizeAssessment(assessment: any) {
    return {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        instructions: assessment.instructions,
        skills: assessment.skills,
        timing: assessment.timing,
        timer: assessment.timer,
        security: assessment.security,
        totalPoints: assessment.totalPoints,

        resultSettings: {
            showResultToEmployee:
                assessment.resultSettings?.showResultToEmployee ?? false,
        },

        questions: assessment.questions.map((question: any) => ({
            questionId: question.questionId,
            order: question.order,
            question: question.question,
            type: question.type,
            points: question.points,
            required: question.required,

            selectionType: question.selectionType,

            /*
             * IMPORTANT:
             *
             * Never expose isCorrect to the employee.
             */

            options: question.options?.map((option: any) => ({
                optionId: option.optionId,
                text: option.text,
            })),

            language: question.language,
            starterCode: question.starterCode,
            inputDescription: question.inputDescription,
            outputDescription: question.outputDescription,
            constraints: question.constraints,
            minLength: question.minLength,
            maxLength: question.maxLength,
            answerPlaceholder: question.answerPlaceholder,
            autoEvaluate: question.autoEvaluate,
        })),
    };
}