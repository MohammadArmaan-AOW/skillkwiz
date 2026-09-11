import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import Employee from "@/lib/db/employeeSchema";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import { sendEmail } from "@/lib/email/sendEmail";
import { assessmentDeletedTemplate } from "@/lib/emailTemplates/assessmentDeletedTemplate";

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

function errorResponse(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

function isValidDate(value: unknown): value is string | Date {
    const date = new Date(value as string | Date);

    return !Number.isNaN(date.getTime());
}

function isPositiveNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) => typeof item === "string" && item.trim().length > 0,
        )
    );
}

// -----------------------------------------------------
// Question Validation
// -----------------------------------------------------

function validateQuestions(questions: unknown): string | null {
    if (!Array.isArray(questions)) {
        return "Questions must be an array.";
    }

    const questionIds = new Set<string>();
    const orders = new Set<number>();

    for (const item of questions) {
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
            return "Each question must be a valid object.";
        }

        const question = item as Record<string, unknown>;

        // questionId
        if (
            typeof question.questionId !== "string" ||
            !question.questionId.trim()
        ) {
            return "Each question must have a valid questionId.";
        }

        if (questionIds.has(question.questionId.trim())) {
            return `Duplicate questionId found: ${question.questionId}`;
        }

        questionIds.add(question.questionId.trim());

        // order
        if (
            typeof question.order !== "number" ||
            !Number.isInteger(question.order) ||
            question.order < 1
        ) {
            return "Each question must have a valid order.";
        }

        if (orders.has(question.order)) {
            return `Duplicate question order found: ${question.order}`;
        }

        orders.add(question.order);

        // question text
        if (
            typeof question.question !== "string" ||
            question.question.length === 0
        ) {
            return "Each question must have question text.";
        }

        // type
        const allowedTypes = [
            "short-text",
            "long-text",
            "coding",
            "project-report",
            "mcq",
        ];

        if (
            typeof question.type !== "string" ||
            !allowedTypes.includes(question.type)
        ) {
            return `Invalid question type for question ${question.questionId}.`;
        }

        // points
        if (
            question.points !== undefined &&
            !isNonNegativeNumber(question.points)
        ) {
            return `Invalid points for question ${question.questionId}.`;
        }

        // required
        if (
            question.required !== undefined &&
            typeof question.required !== "boolean"
        ) {
            return `Invalid required value for question ${question.questionId}.`;
        }

        // autoEvaluate
        if (
            question.autoEvaluate !== undefined &&
            typeof question.autoEvaluate !== "boolean"
        ) {
            return `Invalid autoEvaluate value for question ${question.questionId}.`;
        }

        // -------------------------------------------------
        // MCQ
        // -------------------------------------------------

        if (question.type === "mcq") {
            if (
                question.selectionType !== "single" &&
                question.selectionType !== "multiple"
            ) {
                return `MCQ question ${question.questionId} must have selectionType as single or multiple.`;
            }

            if (
                !Array.isArray(question.options) ||
                question.options.length === 0
            ) {
                return `MCQ question ${question.questionId} must have at least one option.`;
            }

            const optionIds = new Set<string>();
            let correctCount = 0;

            for (const option of question.options) {
                if (
                    typeof option !== "object" ||
                    option === null ||
                    Array.isArray(option)
                ) {
                    return `Invalid option in question ${question.questionId}.`;
                }

                const optionData = option as Record<string, unknown>;

                if (
                    typeof optionData.optionId !== "string" ||
                    !optionData.optionId.trim()
                ) {
                    return `Every MCQ option in ${question.questionId} must have a valid optionId.`;
                }

                if (optionIds.has(optionData.optionId.trim())) {
                    return `Duplicate optionId found in question ${question.questionId}.`;
                }

                optionIds.add(optionData.optionId.trim());

                if (
                    typeof optionData.text !== "string" ||
                    optionData.text.length === 0
                ) {
                    return `Every MCQ option in ${question.questionId} must have option text.`;
                }

                if (
                    optionData.isCorrect !== undefined &&
                    typeof optionData.isCorrect !== "boolean"
                ) {
                    return `Invalid isCorrect value in question ${question.questionId}.`;
                }

                if (optionData.isCorrect === true) {
                    correctCount++;
                }
            }

            if (correctCount === 0) {
                return `MCQ question ${question.questionId} must have at least one correct option.`;
            }

            if (question.selectionType === "single" && correctCount !== 1) {
                return `Single-selection MCQ ${question.questionId} must have exactly one correct option.`;
            }
        }

        // -------------------------------------------------
        // Text / Project Report
        // -------------------------------------------------

        if (
            question.type === "short-text" ||
            question.type === "long-text" ||
            question.type === "project-report"
        ) {
            if (
                question.minLength !== undefined &&
                (typeof question.minLength !== "number" ||
                    !Number.isInteger(question.minLength) ||
                    question.minLength < 0)
            ) {
                return `Invalid minLength for question ${question.questionId}.`;
            }

            if (
                question.maxLength !== undefined &&
                (typeof question.maxLength !== "number" ||
                    !Number.isInteger(question.maxLength) ||
                    question.maxLength < 1)
            ) {
                return `Invalid maxLength for question ${question.questionId}.`;
            }

            if (
                typeof question.minLength === "number" &&
                typeof question.maxLength === "number" &&
                question.minLength > question.maxLength
            ) {
                return `minLength cannot be greater than maxLength for question ${question.questionId}.`;
            }

            if (
                question.answerPlaceholder !== undefined &&
                typeof question.answerPlaceholder !== "string"
            ) {
                return `Invalid answerPlaceholder for question ${question.questionId}.`;
            }
        }

        // -------------------------------------------------
        // Coding
        // -------------------------------------------------

        if (question.type === "coding") {
            if (
                question.language !== undefined &&
                typeof question.language !== "string"
            ) {
                return `Invalid language for coding question ${question.questionId}.`;
            }

            if (
                question.starterCode !== undefined &&
                typeof question.starterCode !== "string"
            ) {
                return `Invalid starterCode for coding question ${question.questionId}.`;
            }

            if (
                question.inputDescription !== undefined &&
                typeof question.inputDescription !== "string"
            ) {
                return `Invalid inputDescription for coding question ${question.questionId}.`;
            }

            if (
                question.outputDescription !== undefined &&
                typeof question.outputDescription !== "string"
            ) {
                return `Invalid outputDescription for coding question ${question.questionId}.`;
            }

            if (
                question.constraints !== undefined &&
                typeof question.constraints !== "string"
            ) {
                return `Invalid constraints for coding question ${question.questionId}.`;
            }
        }

        // explanation
        if (
            question.explanation !== undefined &&
            typeof question.explanation !== "string"
        ) {
            return `Invalid explanation for question ${question.questionId}.`;
        }
    }

    return null;
}

// -----------------------------------------------------
// Assigned Employee Validation
// -----------------------------------------------------

async function validateAssignedEmployees(
    assignedEmployees: unknown,
    employerId: mongoose.Types.ObjectId,
): Promise<{
    error: string | null;
    employeeIds: mongoose.Types.ObjectId[];
}> {
    if (!Array.isArray(assignedEmployees)) {
        return {
            error: "assignedEmployees must be an array.",
            employeeIds: [],
        };
    }

    const employeeIds: mongoose.Types.ObjectId[] = [];
    const uniqueIds = new Set<string>();

    for (const item of assignedEmployees) {
        let employeeId: string | null = null;

        if (typeof item === "string") {
            employeeId = item;
        } else if (
            typeof item === "object" &&
            item !== null &&
            "employeeId" in item &&
            typeof (item as Record<string, unknown>).employeeId === "string"
        ) {
            employeeId = (item as Record<string, string>).employeeId;
        }

        if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
            return {
                error: `Invalid employee ID: ${String(employeeId)}`,
                employeeIds: [],
            };
        }

        if (uniqueIds.has(employeeId)) {
            return {
                error: `Duplicate employee ID: ${employeeId}`,
                employeeIds: [],
            };
        }

        uniqueIds.add(employeeId);

        employeeIds.push(new mongoose.Types.ObjectId(employeeId));
    }

    if (employeeIds.length === 0) {
        return {
            error: null,
            employeeIds: [],
        };
    }

    const employees = await Employee.find({
        _id: { $in: employeeIds },
        employerId,
    })
        .select("_id")
        .lean();

    const validEmployeeIds = new Set(
        employees.map((employee) => employee._id.toString()),
    );

    for (const employeeId of employeeIds) {
        if (!validEmployeeIds.has(employeeId.toString())) {
            return {
                error: `Employee ${employeeId.toString()} does not belong to this employer or does not exist.`,
                employeeIds: [],
            };
        }
    }

    return {
        error: null,
        employeeIds,
    };
}

// -----------------------------------------------------
// GET /api/employer/assessment/:id
// -----------------------------------------------------

export async function GET(
    _request: NextRequest,
    context: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        const employer = await requireEmployer();

        if (!employer) {
            return errorResponse("Employer authentication required.", 401);
        }

        const { id } = await context.params;

        if (!mongoose.isValidObjectId(id)) {
            return errorResponse("Invalid assessment ID.", 400);
        }

        await connectDB();

        const assessment = await Assessment.findOne({
            _id: id,
            employerId: employer._id,
        }).lean();

        if (!assessment) {
            return errorResponse("Assessment not found.", 404);
        }

        return NextResponse.json(
            {
                success: true,
                assessment,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/employer/assessment/[id] error:", error);

        return errorResponse("Failed to fetch assessment.", 500);
    }
}

// -----------------------------------------------------
// PATCH /api/employer/assessment/:id
// -----------------------------------------------------

export async function PATCH(
    request: NextRequest,
    context: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        const employer = await requireEmployer();

        if (!employer) {
            return errorResponse("Employer authentication required.", 401);
        }

        const { id } = await context.params;

        if (!mongoose.isValidObjectId(id)) {
            return errorResponse("Invalid assessment ID.", 400);
        }

        await connectDB();

        const existingAssessment = await Assessment.findOne({
            _id: id,
            employerId: employer._id,
        });

        if (!existingAssessment) {
            return errorResponse("Assessment not found.", 404);
        }

        const body = await request.json();

        if (typeof body !== "object" || body === null || Array.isArray(body)) {
            return errorResponse("Request body must be a valid object.", 400);
        }

        // -------------------------------------------------
        // Protected fields
        // -------------------------------------------------

        if ("employerId" in body) {
            return errorResponse("employerId cannot be changed.", 400);
        }

        if ("totalPoints" in body) {
            return errorResponse(
                "totalPoints cannot be changed directly.",
                400,
            );
        }

        // -------------------------------------------------
        // Build update object
        // -------------------------------------------------

        const updateData: Record<string, unknown> = {};

        // -------------------------------------------------
        // Basic fields
        // -------------------------------------------------

        if ("title" in body) {
            if (typeof body.title !== "string" || !body.title.trim()) {
                return errorResponse("Title is required.", 400);
            }

            updateData.title = body.title.trim();
        }

        if ("description" in body) {
            if (
                body.description !== undefined &&
                typeof body.description !== "string"
            ) {
                return errorResponse("Description must be a string.", 400);
            }

            updateData.description = body.description?.trim() ?? "";
        }

        if ("instructions" in body) {
            if (
                body.instructions !== undefined &&
                typeof body.instructions !== "string"
            ) {
                return errorResponse("Instructions must be a string.", 400);
            }

            updateData.instructions = body.instructions?.trim() ?? "";
        }

        // -------------------------------------------------
        // Skills
        // -------------------------------------------------

        if ("skills" in body) {
            if (body.skills !== undefined && !isStringArray(body.skills)) {
                return errorResponse(
                    "Skills must be an array of non-empty strings.",
                    400,
                );
            }

            updateData.skills =
                body.skills?.map((skill: string) => skill.trim()) ?? [];
        }

        // -------------------------------------------------
        // Timing
        // -------------------------------------------------

        let timing = existingAssessment.timing;

        if ("timing" in body) {
            if (
                typeof body.timing !== "object" ||
                body.timing === null ||
                Array.isArray(body.timing)
            ) {
                return errorResponse("Timing must be a valid object.", 400);
            }

            const incomingTiming = body.timing;

            const startAt =
                incomingTiming.startAt ?? existingAssessment.timing.startAt;

            const endAt =
                incomingTiming.endAt ?? existingAssessment.timing.endAt;

            const durationMinutes =
                incomingTiming.durationMinutes ??
                existingAssessment.timing.durationMinutes;

            if (!isValidDate(startAt)) {
                return errorResponse("Invalid timing.startAt.", 400);
            }

            if (!isValidDate(endAt)) {
                return errorResponse("Invalid timing.endAt.", 400);
            }

            if (!isPositiveNumber(durationMinutes)) {
                return errorResponse(
                    "timing.durationMinutes must be greater than 0.",
                    400,
                );
            }

            const startDate = new Date(startAt);
            const endDate = new Date(endAt);

            if (startDate >= endDate) {
                return errorResponse(
                    "Assessment start time must be before end time.",
                    400,
                );
            }

            const windowMinutes =
                (endDate.getTime() - startDate.getTime()) / (1000 * 60);

            if (durationMinutes > windowMinutes) {
                return errorResponse(
                    "Assessment duration cannot exceed the assessment time window.",
                    400,
                );
            }

            timing = {
                startAt: startDate,
                endAt: endDate,
                durationMinutes,
            };

            updateData.timing = timing;
        }

        // -------------------------------------------------
        // Timer
        // -------------------------------------------------

        if ("timer" in body) {
            if (
                typeof body.timer !== "object" ||
                body.timer === null ||
                Array.isArray(body.timer)
            ) {
                return errorResponse("Timer must be a valid object.", 400);
            }

            const timer = body.timer;

            if (
                timer.enabled !== undefined &&
                typeof timer.enabled !== "boolean"
            ) {
                return errorResponse("timer.enabled must be a boolean.", 400);
            }

            if (
                timer.autoSubmitOnExpiry !== undefined &&
                typeof timer.autoSubmitOnExpiry !== "boolean"
            ) {
                return errorResponse(
                    "timer.autoSubmitOnExpiry must be a boolean.",
                    400,
                );
            }

            updateData.timer = {
                enabled: timer.enabled ?? existingAssessment.timer.enabled,

                autoSubmitOnExpiry:
                    timer.autoSubmitOnExpiry ??
                    existingAssessment.timer.autoSubmitOnExpiry,
            };
        }

        // -------------------------------------------------
        // Security
        // -------------------------------------------------

        if ("security" in body) {
            if (
                typeof body.security !== "object" ||
                body.security === null ||
                Array.isArray(body.security)
            ) {
                return errorResponse("Security must be a valid object.", 400);
            }

            const security = body.security;

            const trackTabChanges =
                security.trackTabChanges ??
                existingAssessment.security.trackTabChanges;

            const maxTabChanges =
                security.maxTabChanges ??
                existingAssessment.security.maxTabChanges;

            if (typeof trackTabChanges !== "boolean") {
                return errorResponse(
                    "security.trackTabChanges must be a boolean.",
                    400,
                );
            }

            if (
                maxTabChanges !== undefined &&
                (typeof maxTabChanges !== "number" ||
                    !Number.isInteger(maxTabChanges) ||
                    maxTabChanges < 0)
            ) {
                return errorResponse(
                    "security.maxTabChanges must be a non-negative integer.",
                    400,
                );
            }

            if (!trackTabChanges && maxTabChanges !== undefined) {
                return errorResponse(
                    "maxTabChanges cannot be configured when tab-change tracking is disabled.",
                    400,
                );
            }

            updateData.security = {
                trackTabChanges,
                ...(maxTabChanges !== undefined ? { maxTabChanges } : {}),
            };
        }

        // -------------------------------------------------
        // Questions
        // -------------------------------------------------

        let finalQuestions = existingAssessment.questions;

        if ("questions" in body) {
            const questionError = validateQuestions(body.questions);

            if (questionError) {
                return errorResponse(questionError, 400);
            }

            finalQuestions = body.questions;

            updateData.questions = finalQuestions;
        }

        // -------------------------------------------------
        // Calculate total points server-side
        // -------------------------------------------------

        if ("questions" in body) {
            const totalPoints = finalQuestions.reduce(
                (
                    total: number,
                    question: {
                        points?: number;
                    },
                ) => total + (question.points ?? 0),
                0,
            );

            updateData.totalPoints = totalPoints;
        }

        // -------------------------------------------------
        // Assigned Employees
        // -------------------------------------------------

        if ("assignedEmployees" in body) {
            const assignmentValidation = await validateAssignedEmployees(
                body.assignedEmployees,
                employer._id,
            );

            if (assignmentValidation.error) {
                return errorResponse(assignmentValidation.error, 400);
            }

            const existingAssignments =
                existingAssessment.assignedEmployees ?? [];

            const existingAssignmentMap = new Map(
                existingAssignments.map((assignment) => [
                    assignment.employeeId.toString(),
                    assignment,
                ]),
            );

            const now = new Date();

            updateData.assignedEmployees = assignmentValidation.employeeIds.map(
                (employeeId) => {
                    const employeeIdString = employeeId.toString();

                    const existingAssignment =
                        existingAssignmentMap.get(employeeIdString);

                    if (existingAssignment) {
                        return existingAssignment;
                    }

                    return {
                        employeeId,
                        assignedAt: now,
                        status: "assigned",
                    };
                },
            );
        }

        // -------------------------------------------------
        // Result Settings
        // -------------------------------------------------

        if ("resultSettings" in body) {
            if (
                typeof body.resultSettings !== "object" ||
                body.resultSettings === null ||
                Array.isArray(body.resultSettings)
            ) {
                return errorResponse(
                    "resultSettings must be a valid object.",
                    400,
                );
            }

            const resultSettings = body.resultSettings;

            const showResultToEmployee =
                resultSettings.showResultToEmployee ??
                existingAssessment.resultSettings.showResultToEmployee;

            const showCorrectAnswersToEmployee =
                resultSettings.showCorrectAnswersToEmployee ??
                existingAssessment.resultSettings.showCorrectAnswersToEmployee;

            if (typeof showResultToEmployee !== "boolean") {
                return errorResponse(
                    "showResultToEmployee must be a boolean.",
                    400,
                );
            }

            if (typeof showCorrectAnswersToEmployee !== "boolean") {
                return errorResponse(
                    "showCorrectAnswersToEmployee must be a boolean.",
                    400,
                );
            }

            if (showCorrectAnswersToEmployee && !showResultToEmployee) {
                return errorResponse(
                    "showCorrectAnswersToEmployee cannot be enabled when showResultToEmployee is disabled.",
                    400,
                );
            }

            updateData.resultSettings = {
                showResultToEmployee,
                showCorrectAnswersToEmployee,
            };
        }

        // -------------------------------------------------
        // Status
        // -------------------------------------------------

        if ("status" in body) {
            const allowedStatuses = [
                "draft",
                "published",
                "closed",
                "archived",
            ];

            if (
                typeof body.status !== "string" ||
                !allowedStatuses.includes(body.status)
            ) {
                return errorResponse("Invalid assessment status.", 400);
            }

            updateData.status = body.status;
        }

        // -------------------------------------------------
        // Prevent empty PATCH
        // -------------------------------------------------

        if (Object.keys(updateData).length === 0) {
            return errorResponse("No valid fields provided for update.", 400);
        }

        // -------------------------------------------------
        // Update
        // -------------------------------------------------

        const updatedAssessment = await Assessment.findOneAndUpdate(
            {
                _id: id,
                employerId: employer._id,
            },
            {
                $set: updateData,
            },
            {
                new: true,
                runValidators: true,
            },
        ).lean();

        if (!updatedAssessment) {
            return errorResponse("Assessment not found.", 404);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Assessment updated successfully.",
                assessment: updatedAssessment,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("PATCH /api/employer/assessment/[id] error:", error);

        return errorResponse("Failed to update assessment.", 500);
    }
}

// -----------------------------------------------------
// DELETE /api/employer/assessment/:id
// -----------------------------------------------------

export async function DELETE(
    _request: NextRequest,
    context: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        const employer = await requireEmployer();

        if (!employer) {
            return errorResponse("Employer authentication required.", 401);
        }

        const { id } = await context.params;

        if (!mongoose.isValidObjectId(id)) {
            return errorResponse("Invalid assessment ID.", 400);
        }

        await connectDB();

        const assessment = await Assessment.findOne({
            _id: id,
            employerId: employer._id,
        }).lean();

        if (!assessment) {
            return errorResponse("Assessment not found.", 404);
        }

        /* ------------------------------------------------------------------ */
        /* Fetch assigned employees before deleting the assessment             */
        /* ------------------------------------------------------------------ */

        const employeeIds = assessment.assignedEmployees.map(
            (assignment) => assignment.employeeId,
        );

        const employees =
            employeeIds.length > 0
                ? await Employee.find({
                      _id: {
                          $in: employeeIds,
                      },
                      employerId: employer._id,
                  })
                      .select("_id fullName email")
                      .lean()
                : [];

        /* ------------------------------------------------------------------ */
        /* Delete assessment                                                   */
        /* ------------------------------------------------------------------ */

        await Assessment.deleteOne({
            _id: id,
            employerId: employer._id,
        });

        /* ------------------------------------------------------------------ */
        /* Send cancellation emails                                            */
        /* ------------------------------------------------------------------ */

        if (employees.length > 0) {
            await Promise.allSettled(
                employees.map(async (employee) => {
                    try {
                        await sendEmail({
                            to: employee.email,
                            subject: `Assessment Cancelled – ${assessment.title}`,
                            html: assessmentDeletedTemplate({
                                employeeName: employee.fullName,
                                assessmentTitle: assessment.title,
                                startAt: assessment.timing.startAt,
                                endAt: assessment.timing.endAt,
                            }),
                        });
                    } catch (emailError) {
                        console.error(
                            `Failed to send assessment deletion email to ${employee.email}:`,
                            emailError,
                        );
                    }
                }),
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Assessment deleted successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("DELETE /api/employer/assessment/[id] error:", error);

        return errorResponse("Failed to delete assessment.", 500);
    }
}
