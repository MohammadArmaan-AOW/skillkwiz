import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireEmployee } from "@/lib/auth/requireEmployee";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import AssessmentAttempt, { IAssessmentAttemptAnswer } from "@/lib/db/assessmentAttemptSchema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface AnswerRequestBody {
    questionId?: string;
    answer?: string;
    selectedOptions?: string[];
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

        let body: AnswerRequestBody;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body.",
                },
                { status: 400 },
            );
        }

        const { questionId, answer, selectedOptions } = body;

        if (!questionId || typeof questionId !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "questionId is required.",
                },
                { status: 400 },
            );
        }

        if (
            answer !== undefined &&
            typeof answer !== "string"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "answer must be a string.",
                },
                { status: 400 },
            );
        }

        if (
            selectedOptions !== undefined &&
            (
                !Array.isArray(selectedOptions) ||
                !selectedOptions.every(
                    (optionId) => typeof optionId === "string",
                )
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "selectedOptions must be an array of strings.",
                },
                { status: 400 },
            );
        }

        await connectDB();

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

        const assignment = assessment.assignedEmployees.find(
            (item) =>
                item.employeeId.toString() === employee._id.toString(),
        );

        if (!assignment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Assessment is not assigned to you.",
                },
                { status: 403 },
            );
        }

        if (assignment.status !== "in-progress") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Assessment is not currently in progress.",
                    status: assignment.status,
                },
                { status: 409 },
            );
        }

        const attempt = await AssessmentAttempt.findOne({
            assessmentId: assessment._id,
            employeeId: employee._id,
            status: "in-progress",
        });

        if (!attempt) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No active assessment attempt found. Start the assessment first.",
                },
                { status: 404 },
            );
        }

        const now = new Date();

        /*
         * The assessment end time is always authoritative.
         */
        if (now >= assessment.timing.endAt) {
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
                    message: "Assessment time has ended.",
                    status: "expired",
                },
                { status: 410 },
            );
        }

        /*
         * For timed assessments, the attempt expiry is also
         * checked server-side on every answer operation.
         */
        if (
            assessment.timer.enabled &&
            attempt.expiresAt &&
            now >= attempt.expiresAt
        ) {
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
                    message: "Assessment time has expired.",
                    status: "expired",
                },
                { status: 410 },
            );
        }

        const question = assessment.questions.find(
            (item) => item.questionId === questionId,
        );

        if (!question) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Question not found in this assessment.",
                },
                { status: 404 },
            );
        }

        /*
         * MCQ validation.
         *
         * Only option IDs are accepted from the employee.
         * isCorrect is never accepted from the client.
         */
        if (question.type === "mcq") {
            if (
                answer !== undefined &&
                answer.trim().length > 0
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "MCQ questions must use selectedOptions.",
                    },
                    { status: 400 },
                );
            }

            if (!selectedOptions) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "selectedOptions is required for MCQ questions.",
                    },
                    { status: 400 },
                );
            }

            const validOptionIds = new Set(
                (question.options ?? []).map(
                    (option) => option.optionId,
                ),
            );

            const hasInvalidOption = selectedOptions.some(
                (optionId) => !validOptionIds.has(optionId),
            );

            if (hasInvalidOption) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "One or more selected options are invalid.",
                    },
                    { status: 400 },
                );
            }

            if (question.selectionType === "single") {
                if (selectedOptions.length !== 1) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                "This question requires exactly one option.",
                        },
                        { status: 400 },
                    );
                }
            }

            if (question.selectionType === "multiple") {
                if (selectedOptions.length < 1) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                "Select at least one option for this question.",
                        },
                        { status: 400 },
                    );
                }
            }
        } else {
            /*
             * Non-MCQ questions use the answer field.
             */
            if (selectedOptions !== undefined) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "selectedOptions can only be used for MCQ questions.",
                    },
                    { status: 400 },
                );
            }

            if (answer === undefined) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "answer is required.",
                    },
                    { status: 400 },
                );
            }

            /*
             * maxLength is enforced while saving so the database
             * never receives an answer beyond the configured limit.
             *
             * minLength is intentionally not enforced here because
             * this endpoint supports autosave while the employee is
             * still typing.
             */
            if (
                question.maxLength !== undefined &&
                answer.length > question.maxLength
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Answer cannot exceed ${question.maxLength} characters.`,
                    },
                    { status: 400 },
                );
            }
        }

        const existingAnswerIndex = attempt.answers.findIndex(
    (item: IAssessmentAttemptAnswer) =>
        item.questionId === questionId,
);

        const answerData = {
            questionId,
            ...(question.type === "mcq"
                ? {
                      selectedOptions: selectedOptions ?? [],
                  }
                : {
                      answer: answer ?? "",
                  }),
            answeredAt: now,
        };

        if (existingAnswerIndex >= 0) {
            attempt.answers[existingAnswerIndex] = answerData;
        } else {
            attempt.answers.push(answerData);
        }

        await attempt.save();

        return NextResponse.json(
            {
                success: true,
                message: "Answer saved successfully.",
                data: {
                    attemptId: attempt._id,
                    questionId,
                    answer:
                        question.type === "mcq"
                            ? undefined
                            : answer ?? "",
                    selectedOptions:
                        question.type === "mcq"
                            ? selectedOptions ?? []
                            : undefined,
                    answeredAt: now,
                    expiresAt: attempt.expiresAt ?? null,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(
            "Employee assessment answer error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while saving the answer.",
            },
            { status: 500 },
        );
    }
}
