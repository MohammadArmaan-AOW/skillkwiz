import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireEmployee } from "@/lib/auth/requireEmployee";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import AssessmentAttempt, {
    IAssessmentAttemptAnswer,
} from "@/lib/db/assessmentAttemptSchema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface AssessmentQuestionOption {
    optionId: string;
    text: string;
    isCorrect: boolean;
}

export async function POST(request: NextRequest, context: RouteContext) {
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
         * Find the assessment and make sure it is assigned
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
            (item) => item.employeeId.toString() === employee._id.toString(),
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

        /*
         * Find the active attempt.
         *
         * There is intentionally no assignmentId here because
         * assignments are embedded inside Assessment.
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
                        "No active assessment attempt found. Start the assessment first.",
                },
                { status: 404 },
            );
        }

        const now = new Date();

        /*
         * ---------------------------------------------------------
         * SERVER-SIDE EXPIRY CHECK
         * ---------------------------------------------------------
         *
         * The server is authoritative for assessment timing.
         *
         * Assessment endAt always takes precedence.
         *
         * For timed assessments, the attempt expiresAt is also
         * checked.
         */
        const assessmentExpired = now >= assessment.timing.endAt;

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
                    message: "Assessment time has expired.",
                    status: "expired",
                },
                { status: 410 },
            );
        }

        /*
         * ---------------------------------------------------------
         * VALIDATE ANSWERS
         * ---------------------------------------------------------
         *
         * Required questions, text length and MCQ structure
         * are validated before final submission.
         */
        const validationErrors: string[] = [];

        for (const question of assessment.questions) {
            const submittedAnswer = attempt.answers.find(
                (item: IAssessmentAttemptAnswer) =>
                    item.questionId === question.questionId,
            );

            /*
             * Required question with no saved answer.
             */
            if (!submittedAnswer) {
                if (question.required) {
                    validationErrors.push(
                        `Question ${question.order} is required.`,
                    );
                }

                continue;
            }

            /*
             * -----------------------------------------------------
             * MCQ VALIDATION
             * -----------------------------------------------------
             */
            if (question.type === "mcq") {
                const selectedOptions = submittedAnswer.selectedOptions ?? [];

                /*
                 * Required MCQ must have at least one selection.
                 */
                if (question.required && selectedOptions.length === 0) {
                    validationErrors.push(
                        `Question ${question.order} requires an answer.`,
                    );

                    continue;
                }

                /*
                 * Verify that every submitted option actually
                 * belongs to this question.
                 *
                 * We do NOT trust any isCorrect value from the
                 * employee/client.
                 */
                const validOptionIds = new Set(
                    (question.options ?? []).map(
                        (option: AssessmentQuestionOption) => option.optionId,
                    ),
                );

                const hasInvalidOption = selectedOptions.some(
                    (optionId: string) => !validOptionIds.has(optionId),
                );

                if (hasInvalidOption) {
                    validationErrors.push(
                        `Question ${question.order} contains an invalid option.`,
                    );

                    continue;
                }

                /*
                 * Single-select MCQ must contain exactly one option.
                 */
                if (question.selectionType === "single") {
                    if (selectedOptions.length !== 1) {
                        validationErrors.push(
                            `Question ${question.order} requires exactly one option.`,
                        );
                    }
                }

                /*
                 * Multiple-select MCQ must contain at least one
                 * option when submitted.
                 */
                if (question.selectionType === "multiple") {
                    if (selectedOptions.length === 0) {
                        validationErrors.push(
                            `Question ${question.order} requires at least one option.`,
                        );
                    }
                }

                continue;
            }

            /*
             * -----------------------------------------------------
             * TEXT / CODING / PROJECT REPORT VALIDATION
             * -----------------------------------------------------
             */
            const submittedText = submittedAnswer.answer ?? "";

            /*
             * Required non-MCQ question cannot be empty.
             */
            if (question.required && submittedText.trim().length === 0) {
                validationErrors.push(
                    `Question ${question.order} requires an answer.`,
                );

                continue;
            }

            /*
             * Minimum length is checked only on final submission.
             */
            if (
                question.minLength !== undefined &&
                submittedText.length < question.minLength
            ) {
                validationErrors.push(
                    `Question ${question.order} requires at least ${question.minLength} characters.`,
                );
            }

            /*
             * Maximum length is also checked again during final
             * submission for safety.
             */
            if (
                question.maxLength !== undefined &&
                submittedText.length > question.maxLength
            ) {
                validationErrors.push(
                    `Question ${question.order} cannot exceed ${question.maxLength} characters.`,
                );
            }
        }

        /*
         * If any validation failed, keep the attempt in-progress
         * so the employee can correct the answers.
         */
        if (validationErrors.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please complete all required questions correctly before submitting.",
                    errors: validationErrors,
                },
                { status: 400 },
            );
        }

        /*
         * ---------------------------------------------------------
         * SERVER-SIDE MCQ EVALUATION
         * ---------------------------------------------------------
         *
         * Correct answers are read ONLY from the database.
         *
         * isCorrect is never received from the client and is
         * never returned in the response.
         */
        let score = 0;

        for (const question of assessment.questions) {
            const submittedAnswer = attempt.answers.find(
                (item: IAssessmentAttemptAnswer) =>
                    item.questionId === question.questionId,
            );

            if (!submittedAnswer) {
                continue;
            }

            /*
             * At this stage only MCQs are automatically evaluated.
             *
             * Text, coding and project-report questions can be
             * evaluated separately according to their configured
             * evaluation flow.
             */
            if (question.type !== "mcq") {
                continue;
            }

            const selectedOptions = [
                ...(submittedAnswer.selectedOptions ?? []),
            ].sort();

            /*
             * Read the correct options from the server-side
             * assessment document.
             */
            const correctOptions = (question.options ?? [])
                .filter((option: AssessmentQuestionOption) => option.isCorrect)
                .map((option: AssessmentQuestionOption) => option.optionId)
                .sort();

            /*
             * For an answer to be completely correct:
             *
             * 1. Number of selected options must match.
             * 2. Every selected option must match the corresponding
             *    correct option.
             */
            const isCorrect =
                selectedOptions.length === correctOptions.length &&
                selectedOptions.every(
                    (optionId: string, index: number) =>
                        optionId === correctOptions[index],
                );

            if (isCorrect) {
                score += question.points;
            }
        }

        /*
         * ---------------------------------------------------------
         * SCORE / PERCENTAGE
         * ---------------------------------------------------------
         */
        const totalPoints = assessment.totalPoints;

        const percentage =
            totalPoints > 0
                ? Number(((score / totalPoints) * 100).toFixed(2))
                : 0;

        /*
         * ---------------------------------------------------------
         * FINALIZE ATTEMPT
         * ---------------------------------------------------------
         */
        attempt.status = "completed";
        attempt.submittedAt = now;
        attempt.submissionType = "manual";
        attempt.score = score;
        attempt.percentage = percentage;

        await attempt.save();

        /*
         * ---------------------------------------------------------
         * UPDATE EMBEDDED ASSIGNMENT
         * ---------------------------------------------------------
         */
        assignment.status = "completed";
        assignment.submittedAt = now;

        await assessment.save();

        /*
         * ---------------------------------------------------------
         * RESPONSE
         * ---------------------------------------------------------
         *
         * Respect employer result settings.
         *
         * MCQ evaluation is only returned AFTER submission.
         *
         * We never expose correct answers while the assessment
         * is in progress.
         */

        const showResult =
            assessment.resultSettings?.showResultToEmployee === true;

        const showCorrectAnswers =
            assessment.resultSettings?.showCorrectAnswersToEmployee === true;

        const responseData: {
            attemptId: mongoose.Types.ObjectId;
            status: string;
            submittedAt: Date;
            score?: number;
            percentage?: number;
            mcqResults?: {
                questionId: string;
                question: string;
                isCorrect: boolean;
                awardedPoints: number;
                points: number;
                selectedOptions: string[];
                correctOptions?: string[];
            }[];
        } = {
            attemptId: attempt._id,
            status: attempt.status,
            submittedAt: now,
        };

        /*
         * ---------------------------------------------------------
         * RESULT
         * ---------------------------------------------------------
         */

        if (showResult) {
            responseData.score = score;
            responseData.percentage = percentage;

            /*
             * Build MCQ results only after submission.
             */
            responseData.mcqResults = assessment.questions
                .filter((question) => question.type === "mcq")
                .map((question) => {
                    const submittedAnswer = attempt.answers.find(
                        (item: IAssessmentAttemptAnswer) =>
                            item.questionId === question.questionId,
                    );

                    const selectedOptions = [
                        ...(submittedAnswer?.selectedOptions ?? []),
                    ];

                    const correctOptions = (question.options ?? [])
                        .filter(
                            (option: AssessmentQuestionOption) =>
                                option.isCorrect,
                        )
                        .map(
                            (option: AssessmentQuestionOption) =>
                                option.optionId,
                        );

                    const sortedSelected = [...selectedOptions].sort();
                    const sortedCorrect = [...correctOptions].sort();

                    const isCorrect =
                        sortedSelected.length === sortedCorrect.length &&
                        sortedSelected.every(
                            (optionId, index) =>
                                optionId === sortedCorrect[index],
                        );

                    return {
                        questionId: question.questionId,
                        question: question.question,
                        isCorrect,
                        awardedPoints: isCorrect ? question.points : 0,
                        points: question.points,

                        selectedOptions,

                        /*
                         * Only expose the correct answer when the
                         * employer explicitly enabled it.
                         */
                        ...(showCorrectAnswers
                            ? {
                                  correctOptions,
                              }
                            : {}),
                    };
                });
        }

        return NextResponse.json(
            {
                success: true,
                message: "Assessment submitted successfully.",
                data: responseData,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Employee assessment submit error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Something went wrong while submitting the assessment.",
            },
            { status: 500 },
        );
    }
}
