import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import Employee from "@/lib/db/employeeSchema";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import { assessmentCreatedTemplate } from "@/lib/emailTemplates/assessmentCreatedTemplate";
import { sendEmail } from "@/lib/email/sendEmail";
import Employer from "@/lib/db/employerSchema";

const QUESTION_TYPES = [
    "short-text",
    "long-text",
    "coding",
    "project-report",
    "mcq",
] as const;

const ASSESSMENT_STATUSES = ["draft", "published"] as const;

const MCQ_SELECTION_TYPES = ["single", "multiple"] as const;

function errorResponse(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

function isValidDate(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
}

function isNonNegativeNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPositiveNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) => typeof item === "string" && item.trim().length > 0,
        )
    );
}

/* -------------------------------------------------------------------------- */
/*                              Question Validation                           */
/* -------------------------------------------------------------------------- */

function validateQuestions(questions: unknown) {
    if (!Array.isArray(questions)) {
        return "Questions must be an array.";
    }

    const questionIds = new Set<string>();
    const orders = new Set<number>();

    for (let index = 0; index < questions.length; index++) {
        const question = questions[index];

        if (
            !question ||
            typeof question !== "object" ||
            Array.isArray(question)
        ) {
            return `Question ${index + 1} is invalid.`;
        }

        const q = question as Record<string, unknown>;

        /* ------------------------------------------------------------------ */
        /* questionId                                                          */
        /* ------------------------------------------------------------------ */

        if (
            typeof q.questionId !== "string" ||
            q.questionId.trim().length === 0
        ) {
            return `Question ${index + 1} must have a questionId.`;
        }

        if (questionIds.has(q.questionId)) {
            return `Duplicate questionId "${q.questionId}".`;
        }

        questionIds.add(q.questionId);

        /* ------------------------------------------------------------------ */
        /* order                                                               */
        /* ------------------------------------------------------------------ */

        if (
            typeof q.order !== "number" ||
            !Number.isInteger(q.order) ||
            q.order < 1
        ) {
            return `Question ${index + 1} must have a valid order.`;
        }

        if (orders.has(q.order)) {
            return `Duplicate question order "${q.order}".`;
        }

        orders.add(q.order);

        /* ------------------------------------------------------------------ */
        /* question text                                                       */
        /* ------------------------------------------------------------------ */

        if (typeof q.question !== "string" || q.question.trim().length === 0) {
            return `Question ${index + 1} must contain question text.`;
        }

        /* ------------------------------------------------------------------ */
        /* question type                                                       */
        /* ------------------------------------------------------------------ */

        if (
            typeof q.type !== "string" ||
            !QUESTION_TYPES.includes(q.type as (typeof QUESTION_TYPES)[number])
        ) {
            return `Question ${index + 1} has an invalid question type.`;
        }

        /* ------------------------------------------------------------------ */
        /* points                                                              */
        /* ------------------------------------------------------------------ */

        if (!isNonNegativeNumber(q.points)) {
            return `Question ${index + 1} must have valid points.`;
        }

        /* ------------------------------------------------------------------ */
        /* required                                                            */
        /* ------------------------------------------------------------------ */

        if (typeof q.required !== "boolean") {
            return `Question ${index + 1} must define required as a boolean.`;
        }

        /* ------------------------------------------------------------------ */
        /* autoEvaluate                                                        */
        /* ------------------------------------------------------------------ */

        if (typeof q.autoEvaluate !== "boolean") {
            return `Question ${index + 1} must define autoEvaluate as a boolean.`;
        }

        /* ------------------------------------------------------------------ */
        /* MCQ                                                                 */
        /* ------------------------------------------------------------------ */

        if (q.type === "mcq") {
            if (
                typeof q.selectionType !== "string" ||
                !MCQ_SELECTION_TYPES.includes(
                    q.selectionType as (typeof MCQ_SELECTION_TYPES)[number],
                )
            ) {
                return `MCQ question ${index + 1} must have a valid selectionType.`;
            }

            if (!Array.isArray(q.options)) {
                return `MCQ question ${index + 1} must have options.`;
            }

            if (q.options.length < 2) {
                return `MCQ question ${index + 1} must have at least two options.`;
            }

            const optionIds = new Set<string>();
            let correctCount = 0;

            for (
                let optionIndex = 0;
                optionIndex < q.options.length;
                optionIndex++
            ) {
                const option = q.options[optionIndex];

                if (
                    !option ||
                    typeof option !== "object" ||
                    Array.isArray(option)
                ) {
                    return `Option ${optionIndex + 1} in question ${index + 1} is invalid.`;
                }

                const o = option as Record<string, unknown>;

                if (
                    typeof o.optionId !== "string" ||
                    o.optionId.trim().length === 0
                ) {
                    return `Option ${optionIndex + 1} in question ${index + 1} must have an optionId.`;
                }

                if (optionIds.has(o.optionId)) {
                    return `Duplicate optionId "${o.optionId}" in question ${index + 1}.`;
                }

                optionIds.add(o.optionId);

                /*
                 * Do not trim option text here.
                 * The schema intentionally preserves authored formatting.
                 */

                if (typeof o.text !== "string") {
                    return `Option ${optionIndex + 1} in question ${index + 1} must have text.`;
                }

                if (o.text.length === 0) {
                    return `Option ${optionIndex + 1} in question ${index + 1} cannot be empty.`;
                }

                if (typeof o.isCorrect !== "boolean") {
                    return `Option ${optionIndex + 1} in question ${index + 1} must define isCorrect.`;
                }

                if (o.isCorrect) {
                    correctCount++;
                }
            }

            if (q.selectionType === "single" && correctCount !== 1) {
                return `MCQ question ${index + 1} with single selection must have exactly one correct option.`;
            }

            if (q.selectionType === "multiple" && correctCount < 1) {
                return `MCQ question ${index + 1} with multiple selection must have at least one correct option.`;
            }
        }

        /* ------------------------------------------------------------------ */
        /* Text / Project length validation                                    */
        /* ------------------------------------------------------------------ */

        if (q.minLength !== undefined && !isNonNegativeNumber(q.minLength)) {
            return `Question ${index + 1} has an invalid minLength.`;
        }

        if (q.maxLength !== undefined && !isPositiveNumber(q.maxLength)) {
            return `Question ${index + 1} has an invalid maxLength.`;
        }

        if (
            q.minLength !== undefined &&
            q.maxLength !== undefined &&
            q.minLength > q.maxLength
        ) {
            return `Question ${index + 1} cannot have minLength greater than maxLength.`;
        }
    }

    return null;
}

/* -------------------------------------------------------------------------- */
/*                         Employee Assignment Validation                     */
/* -------------------------------------------------------------------------- */

async function validateAssignedEmployees(
    assignedEmployees: unknown,
    employerId: mongoose.Types.ObjectId,
) {
    if (!Array.isArray(assignedEmployees)) {
        return {
            error: "assignedEmployees must be an array.",
        };
    }

    /*
     * The frontend sends assignment objects:
     *
     * [
     *     {
     *         employeeId: "..."
     *     }
     * ]
     *
     * We extract and validate the employee IDs here.
     */

    const employeeIds: string[] = [];

    for (const assignment of assignedEmployees) {
        if (
            !assignment ||
            typeof assignment !== "object" ||
            Array.isArray(assignment)
        ) {
            return {
                error: "Each assigned employee must be an object.",
            };
        }

        const item = assignment as Record<string, unknown>;

        if (
            typeof item.employeeId !== "string" ||
            item.employeeId.trim().length === 0
        ) {
            return {
                error: "Each assigned employee must have a valid employeeId.",
            };
        }

        employeeIds.push(item.employeeId.trim());
    }

    /*
     * Remove duplicate employee IDs.
     */
    const uniqueIds = [...new Set(employeeIds)];

    /*
     * Validate MongoDB ObjectIds.
     */
    for (const employeeId of uniqueIds) {
        if (!mongoose.isValidObjectId(employeeId)) {
            return {
                error: `Invalid employee ID "${employeeId}".`,
            };
        }
    }

    /*
     * No employees assigned.
     */
    if (uniqueIds.length === 0) {
        return {
            employeeIds: [],
        };
    }

    /*
     * Only employees belonging to the authenticated employer
     * can be assigned to an assessment.
     *
     * We never trust employee IDs coming from the client.
     */
    const employees = await Employee.find({
        _id: {
            $in: uniqueIds,
        },
        employerId,
    })
        .select("_id")
        .lean();

    if (employees.length !== uniqueIds.length) {
        return {
            error: "One or more selected employees do not belong to this employer or do not exist.",
        };
    }

    return {
        employeeIds: uniqueIds,
    };
}

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
    try {
        const employer = await requireEmployer();

        if (!employer) {
            return errorResponse("Employer authentication required.", 401);
        }

        await connectDB();

        const body = await request.json();

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return errorResponse("Invalid request body.", 400);
        }

        const {
            title,
            description,
            instructions,
            skills,
            timing,
            timer,
            security,
            questions,
            assignedEmployees,
            resultSettings,
            status,
        } = body;

        /* ------------------------------------------------------------------ */
        /* Basic information                                                   */
        /* ------------------------------------------------------------------ */

        if (typeof title !== "string" || title.trim().length === 0) {
            return errorResponse("Assessment title is required.", 400);
        }

        if (title.trim().length > 200) {
            return errorResponse(
                "Assessment title cannot exceed 200 characters.",
                400,
            );
        }

        if (description !== undefined && typeof description !== "string") {
            return errorResponse("Description must be a string.", 400);
        }

        if (instructions !== undefined && typeof instructions !== "string") {
            return errorResponse("Instructions must be a string.", 400);
        }

        /* ------------------------------------------------------------------ */
        /* Skills                                                              */
        /* ------------------------------------------------------------------ */

        if (!isStringArray(skills)) {
            return errorResponse(
                "Skills must be an array of non-empty strings.",
                400,
            );
        }

        const normalizedSkills = [
            ...new Set(skills.map((skill: string) => skill.trim())),
        ];

        /* ------------------------------------------------------------------ */
        /* Timing                                                              */
        /* ------------------------------------------------------------------ */

        if (!timing || typeof timing !== "object" || Array.isArray(timing)) {
            return errorResponse(
                "Assessment timing configuration is required.",
                400,
            );
        }

        if (!isValidDate(timing.startAt)) {
            return errorResponse("Invalid assessment startAt.", 400);
        }

        if (!isValidDate(timing.endAt)) {
            return errorResponse("Invalid assessment endAt.", 400);
        }

        const startAt = new Date(timing.startAt);
        const endAt = new Date(timing.endAt);

        if (startAt >= endAt) {
            return errorResponse(
                "Assessment endAt must be later than startAt.",
                400,
            );
        }

        if (
            !isPositiveNumber(timing.durationMinutes) ||
            !Number.isInteger(timing.durationMinutes)
        ) {
            return errorResponse(
                "durationMinutes must be a positive integer.",
                400,
            );
        }

        /*
         * The individual attempt duration cannot exceed
         * the entire assessment availability window.
         */

        const windowDurationMinutes =
            (endAt.getTime() - startAt.getTime()) / (1000 * 60);

        if (timing.durationMinutes > windowDurationMinutes) {
            return errorResponse(
                "Assessment duration cannot be longer than the assessment availability window.",
                400,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Timer                                                               */
        /* ------------------------------------------------------------------ */

        const normalizedTimer = {
            enabled: timer?.enabled === undefined ? true : timer.enabled,

            autoSubmitOnExpiry:
                timer?.autoSubmitOnExpiry === undefined
                    ? true
                    : timer.autoSubmitOnExpiry,
        };

        if (
            typeof normalizedTimer.enabled !== "boolean" ||
            typeof normalizedTimer.autoSubmitOnExpiry !== "boolean"
        ) {
            return errorResponse("Invalid timer configuration.", 400);
        }

        /* ------------------------------------------------------------------ */
        /* Security                                                            */
        /* ------------------------------------------------------------------ */

        const normalizedSecurity = {
            trackTabChanges:
                security?.trackTabChanges === undefined
                    ? false
                    : security.trackTabChanges,

            maxTabChanges: security?.maxTabChanges,
        };

        if (typeof normalizedSecurity.trackTabChanges !== "boolean") {
            return errorResponse("trackTabChanges must be a boolean.", 400);
        }

        if (
            normalizedSecurity.maxTabChanges !== undefined &&
            normalizedSecurity.maxTabChanges !== null
        ) {
            if (
                !Number.isInteger(normalizedSecurity.maxTabChanges) ||
                normalizedSecurity.maxTabChanges < 0
            ) {
                return errorResponse(
                    "maxTabChanges must be a non-negative integer.",
                    400,
                );
            }
        }

        /*
         * maxTabChanges only makes sense when tab tracking
         * is enabled.
         */

        if (
            !normalizedSecurity.trackTabChanges &&
            normalizedSecurity.maxTabChanges !== undefined &&
            normalizedSecurity.maxTabChanges !== null
        ) {
            return errorResponse(
                "maxTabChanges can only be configured when tab-change tracking is enabled.",
                400,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Questions                                                           */
        /* ------------------------------------------------------------------ */

        const questionValidationError = validateQuestions(questions);

        if (questionValidationError) {
            return errorResponse(questionValidationError, 400);
        }

        /* ------------------------------------------------------------------ */
        /* Assigned employees                                                  */
        /* ------------------------------------------------------------------ */

        const assignmentResult = await validateAssignedEmployees(
            assignedEmployees,
            employer._id,
        );

        if (assignmentResult.error) {
            return errorResponse(assignmentResult.error, 400);
        }

        /* ------------------------------------------------------------------ */
        /* Result settings                                                     */
        /* ------------------------------------------------------------------ */

        const normalizedResultSettings = {
            showResultToEmployee:
                resultSettings?.showResultToEmployee === undefined
                    ? false
                    : resultSettings.showResultToEmployee,

            showCorrectAnswersToEmployee:
                resultSettings?.showCorrectAnswersToEmployee === undefined
                    ? false
                    : resultSettings.showCorrectAnswersToEmployee,
        };

        if (
            typeof normalizedResultSettings.showResultToEmployee !==
                "boolean" ||
            typeof normalizedResultSettings.showCorrectAnswersToEmployee !==
                "boolean"
        ) {
            return errorResponse("Invalid result settings.", 400);
        }

        /*
         * Employees should not be allowed to see correct answers
         * unless they can see their result as well.
         */

        if (
            normalizedResultSettings.showCorrectAnswersToEmployee &&
            !normalizedResultSettings.showResultToEmployee
        ) {
            return errorResponse(
                "Correct answers cannot be shown when the assessment result is hidden.",
                400,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Status                                                              */
        /* ------------------------------------------------------------------ */

        const assessmentStatus = status === undefined ? "draft" : status;

        if (!ASSESSMENT_STATUSES.includes(assessmentStatus)) {
            return errorResponse(
                "Assessment status must be draft or published.",
                400,
            );
        }

        /*
         * We calculate totalPoints on the server.
         * Never trust a client-provided totalPoints.
         */

        const totalPoints = questions.reduce(
            (
                total: number,
                question: {
                    points: number;
                },
            ) => total + question.points,
            0,
        );

        /* ------------------------------------------------------------------ */
        /* Create assignment records                                           */
        /* ------------------------------------------------------------------ */

        const now = new Date();

        const assignments = (assignmentResult.employeeIds ?? []).map(
            (employeeId) => ({
                employeeId: new mongoose.Types.ObjectId(employeeId),
                assignedAt: now,
                status: "assigned" as const,
            }),
        );

        /* ------------------------------------------------------------------ */
        /* Deduct assessment credit                                            */
        /* ------------------------------------------------------------------ */

        /*
         * Creating one assessment consumes exactly 1 employer credit.
         *
         * Use an atomic update so concurrent requests cannot consume
         * more credits than the employer actually has.
         */
        const creditResult = await Employer.updateOne(
            {
                _id: employer._id,
                credits: {
                    $gte: 1,
                },
            },
            {
                $inc: {
                    credits: -1,
                },
            },
        );

        if (creditResult.modifiedCount !== 1) {
            return errorResponse(
                "Insufficient credits. Please purchase more credits to create an assessment.",
                402,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Create assessment                                                   */
        /* ------------------------------------------------------------------ */

        let assessment;

        try {
            assessment = await Assessment.create({
                employerId: employer._id,

                title: title.trim(),
                description,
                instructions,

                skills: normalizedSkills,

                timing: {
                    startAt,
                    endAt,
                    durationMinutes: timing.durationMinutes,
                },

                timer: normalizedTimer,

                security: {
                    trackTabChanges: normalizedSecurity.trackTabChanges,

                    ...(normalizedSecurity.maxTabChanges !== undefined &&
                    normalizedSecurity.maxTabChanges !== null
                        ? {
                              maxTabChanges: normalizedSecurity.maxTabChanges,
                          }
                        : {}),
                },

                questions,

                assignedEmployees: assignments,

                totalPoints,

                resultSettings: normalizedResultSettings,

                status: assessmentStatus,
            });
        } catch (error) {
            /*
             * Assessment creation failed after the credit was consumed.
             * Restore the credit so the employer is not charged for
             * an assessment that was never created.
             */
            await Employer.updateOne(
                {
                    _id: employer._id,
                },
                {
                    $inc: {
                        credits: 1,
                    },
                },
            );

            throw error;
        }

        /* -------------------------------------------------------------------------- */
        /*                         Assessment Assignment Emails                        */
        /* -------------------------------------------------------------------------- */

        if (assignmentResult.employeeIds?.length) {
            const employees = await Employee.find({
                _id: {
                    $in: assignmentResult.employeeIds,
                },
                employerId: employer._id,
            })
                .select("_id fullName email")
                .lean();

            await Promise.allSettled(
                employees.map(async (employee) => {
                    try {
                        await sendEmail({
                            to: employee.email,
                            subject: `New Assessment Assigned – ${assessment.title}`,
                            html: assessmentCreatedTemplate({
                                employeeName: employee.fullName,
                                assessmentTitle: assessment.title,
                                assessmentDescription: assessment.description,
                                startAt: assessment.timing.startAt,
                                endAt: assessment.timing.endAt,
                                durationMinutes:
                                    assessment.timing.durationMinutes,
                            }),
                        });
                    } catch (emailError) {
                        console.error(
                            `Failed to send assessment email to ${employee.email}:`,
                            emailError,
                        );
                    }
                }),
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Assessment created successfully.",
                assessment,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Create assessment error:", error);

        if (error instanceof mongoose.Error.ValidationError) {
            return errorResponse("Invalid assessment data.", 400);
        }

        if (error instanceof SyntaxError) {
            return errorResponse("Invalid JSON request body.", 400);
        }

        return errorResponse(
            "Something went wrong while creating the assessment.",
            500,
        );
    }
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(request: Request) {
    try {
        const employer = await requireEmployer();

        if (!employer) {
            return errorResponse("Employer authentication required.", 401);
        }

        await connectDB();

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status") || "all";
        const sort = searchParams.get("sort") || "newest";

        const rawPage = Number(searchParams.get("page") || 1);
        const rawLimit = Number(searchParams.get("limit") || 10);

        const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

        const limit =
            Number.isInteger(rawLimit) && rawLimit > 0
                ? Math.min(rawLimit, 100)
                : 10;

        /*
         * ============================================================
         * FILTER
         * ============================================================
         */

        const filter: Record<string, unknown> = {
            employerId: employer._id,
        };

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    skills: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const allowedStatuses = ["draft", "published", "closed", "archived"];

        if (status !== "all" && allowedStatuses.includes(status)) {
            filter.status = status;
        }

        /*
         * ============================================================
         * SORT
         * ============================================================
         */

        let sortQuery: Record<string, 1 | -1>;

        switch (sort) {
            case "oldest":
                sortQuery = {
                    createdAt: 1,
                };
                break;

            case "name-asc":
                sortQuery = {
                    title: 1,
                };
                break;

            case "name-desc":
                sortQuery = {
                    title: -1,
                };
                break;

            case "newest":
            default:
                sortQuery = {
                    createdAt: -1,
                };
                break;
        }

        /*
         * ============================================================
         * PAGINATION
         * ============================================================
         */

        const skip = (page - 1) * limit;

        const [assessments, total] = await Promise.all([
            Assessment.find(filter)
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean(),

            Assessment.countDocuments(filter),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return NextResponse.json(
            {
                success: true,
                assessments,
                total,
                page,
                limit,
                totalPages,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("Get employer assessments error:", error);

        return errorResponse(
            "Something went wrong while fetching assessments.",
            500,
        );
    }
}
