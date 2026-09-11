import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireEmployee } from "@/lib/auth/requireEmployee";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import AssessmentAttempt from "@/lib/db/assessmentAttemptSchema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const employee = await requireEmployee();

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                { status: 401 },
            );
        }

        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid assessment ID.",
                },
                { status: 400 },
            );
        }

        await connectDB();

        /*
         * Find the assessment only if it is assigned
         * to the authenticated employee.
         */
        const assessment = await Assessment.findOne({
            _id: id,
            "assignedEmployees.employeeId": employee._id,
        });

        if (!assessment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Assessment not found.",
                },
                { status: 404 },
            );
        }

        /*
         * Find the employee's embedded assignment.
         */
        const assignment = assessment.assignedEmployees.find(
            (item) =>
                item.employeeId.toString() ===
                employee._id.toString(),
        );

        if (!assignment) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Assessment is not assigned to you.",
                },
                { status: 403 },
            );
        }

        /*
         * Tab-change tracking is optional and controlled
         * by the assessment security settings.
         */
        if (!assessment.security.trackTabChanges) {
            return NextResponse.json(
                {
                    success: true,
                    message:
                        "Tab-change tracking is disabled for this assessment.",
                    data: {
                        tracked: false,
                        tabChangeCount: 0,
                    },
                },
                { status: 200 },
            );
        }

        /*
         * The employee must have an active attempt.
         */
        const attempt = await AssessmentAttempt.findOne({
            assessmentId: assessment._id,
            employeeId: employee._id,
            status: "in-progress",
        });

        if (!attempt) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No active assessment attempt found.",
                },
                { status: 404 },
            );
        }

        const now = new Date();

        /*
         * ---------------------------------------------------------
         * SERVER-SIDE EXPIRY CHECK
         * ---------------------------------------------------------
         */
        const assessmentExpired =
            now >= assessment.timing.endAt;

        const attemptExpired =
            assessment.timer.enabled &&
            !!attempt.expiresAt &&
            now >= attempt.expiresAt;

        if (assessmentExpired || attemptExpired) {
            attempt.status = "expired";
            attempt.submittedAt = now;
            attempt.submissionType = "auto";

            await attempt.save();

            assignment.status = "expired";
            assignment.submittedAt = now;

            await assessment.save();

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Assessment time has expired.",
                    status: "expired",
                },
                { status: 410 },
            );
        }

        /*
         * ---------------------------------------------------------
         * INCREMENT TAB CHANGE COUNT
         * ---------------------------------------------------------
         */
        attempt.tabChangeCount += 1;

        await attempt.save();

        /*
         * maxTabChanges is intentionally NOT enforced here.
         *
         * The current assessment architecture defines the field,
         * but does not define whether reaching the limit should:
         *
         * - auto-submit
         * - expire the attempt
         * - block the employee
         * - simply record the violation
         *
         * Therefore we only record the count.
         */
        const maxTabChanges =
            assessment.security.maxTabChanges;

        return NextResponse.json(
            {
                success: true,
                message:
                    "Tab change recorded successfully.",
                data: {
                    tracked: true,
                    tabChangeCount:
                        attempt.tabChangeCount,
                    maxTabChanges:
                        maxTabChanges ?? null,
                    remainingTabChanges:
                        typeof maxTabChanges === "number"
                            ? Math.max(
                                  maxTabChanges -
                                      attempt.tabChangeCount,
                                  0,
                              )
                            : null,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(
            "Employee assessment tab-change error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Something went wrong while recording the tab change.",
            },
            { status: 500 },
        );
    }
}
