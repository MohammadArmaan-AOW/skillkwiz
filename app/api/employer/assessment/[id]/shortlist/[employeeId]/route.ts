import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import Employee from "@/lib/db/employeeSchema";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import AssessmentAttempt from "@/lib/db/assessmentAttemptSchema";
import { sendEmail } from "@/lib/email/sendEmail";
import { candidateShortlistedTemplate } from "@/lib/emailTemplates/candidateShortlistedTemplate";

function errorResponse(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

export async function POST(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
            employeeId: string;
        }>;
    },
) {
    try {
        // ---------------------------------------------------------
        // 1. Authenticate employer
        // ---------------------------------------------------------
        const employer = await requireEmployer();

        if (!employer) {
            return errorResponse("Unauthorized", 401);
        }

        // ---------------------------------------------------------
        // 2. Get params
        // ---------------------------------------------------------
        const { id, employeeId } = await context.params;

        // ---------------------------------------------------------
        // 3. Validate IDs
        // ---------------------------------------------------------
        if (!mongoose.isValidObjectId(id)) {
            return errorResponse("Invalid assessment ID.", 400);
        }

        if (!mongoose.isValidObjectId(employeeId)) {
            return errorResponse("Invalid employee ID.", 400);
        }

        await connectDB();

        // ---------------------------------------------------------
        // 4. Find assessment owned by employer
        // ---------------------------------------------------------
        const assessment = await Assessment.findOne({
            _id: id,
            employerId: employer._id,
        });

        if (!assessment) {
            return errorResponse("Assessment not found.", 404);
        }

        // ---------------------------------------------------------
        // 5. Find assignment
        // ---------------------------------------------------------
        const assignment = assessment.assignedEmployees.find(
            (item) => item.employeeId.toString() === employeeId,
        );

        if (!assignment) {
            return errorResponse(
                "Employee is not assigned to this assessment.",
                404,
            );
        }

        // ---------------------------------------------------------
        // 6. Find employee
        // ---------------------------------------------------------
        const employee = await Employee.findOne({
            _id: employeeId,
            employerId: employer._id,
        })
            .select("_id employeeId fullName email")
            .lean();

        if (!employee) {
            return errorResponse("Employee not found.", 404);
        }

        // ---------------------------------------------------------
        // 7. Verify candidate has an attempt
        // ---------------------------------------------------------
        const attempt = await AssessmentAttempt.findOne({
            assessmentId: assessment._id,
            employeeId: employee._id,
        })
            .sort({
                createdAt: -1,
            })
            .lean();

        if (!attempt) {
            return errorResponse(
                "Employee has not attempted this assessment yet.",
                400,
            );
        }

        // ---------------------------------------------------------
        // 8. Candidate must have completed/expired attempt
        // ---------------------------------------------------------
        if (attempt.status !== "completed" && attempt.status !== "expired") {
            return errorResponse(
                "Employee must complete the assessment before being shortlisted.",
                400,
            );
        }

        // ---------------------------------------------------------
        // 9. Prevent duplicate shortlist email
        // ---------------------------------------------------------
        if (assignment.shortlisted === true) {
            return NextResponse.json(
                {
                    success: true,
                    alreadyShortlisted: true,
                    message:
                        "Employee is already shortlisted for this assessment.",
                    shortlist: {
                        shortlisted: true,
                        shortlistedAt: assignment.shortlistedAt ?? null,
                        shortlistEmailSentAt:
                            assignment.shortlistEmailSentAt ?? null,
                    },
                },
                { status: 200 },
            );
        }

        // ---------------------------------------------------------
        // 10. Send shortlist email
        // ---------------------------------------------------------
        try {
            await sendEmail({
                to: employee.email,

                subject: `Congratulations! You've been shortlisted for ${assessment.title}`,

                html: candidateShortlistedTemplate({
                    employeeName: employee.fullName,

                    assessmentTitle: assessment.title,

                    skills: assessment.skills,
                }),
            });
        } catch (emailError) {
            console.error(
                `Failed to send shortlist email to ${employee.email}:`,
                emailError,
            );

            return errorResponse(
                "Candidate could not be shortlisted because the email could not be sent.",
                500,
            );
        }

        // ---------------------------------------------------------
        // 11. Mark candidate as shortlisted
        // ---------------------------------------------------------
        const now = new Date();

        assignment.shortlisted = true;
        assignment.shortlistedAt = now;
        assignment.shortlistEmailSentAt = now;

        await assessment.save();

        // ---------------------------------------------------------
        // 12. Return success
        // ---------------------------------------------------------
        return NextResponse.json(
            {
                success: true,

                message: "Employee shortlisted successfully and email sent.",

                shortlist: {
                    shortlisted: true,
                    shortlistedAt: now,
                    shortlistEmailSentAt: now,
                },

                employee: {
                    id: employee._id,
                    employeeId: employee.employeeId,
                    fullName: employee.fullName,
                    email: employee.email,
                },

                assessment: {
                    id: assessment._id,
                    title: assessment.title,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(
            "POST /api/employer/assessment/[id]/shortlist/[employeeId] error:",
            error,
        );

        return errorResponse("Failed to shortlist employee.", 500);
    }
}
