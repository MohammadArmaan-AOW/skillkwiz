import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import Employee from "@/lib/db/employeeSchema";
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

export async function GET(
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
        // 2. Get route params
        // ---------------------------------------------------------
        const { id, employeeId } = await context.params;

        // ---------------------------------------------------------
        // 3. Validate IDs
        // ---------------------------------------------------------
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse("Invalid assessment ID", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return errorResponse("Invalid employee ID", 400);
        }

        await connectDB();

        // ---------------------------------------------------------
        // 4. Find assessment owned by this employer
        // ---------------------------------------------------------
        const assessment = await Assessment.findOne({
            _id: id,
            employerId: employer._id,
        }).lean();

        if (!assessment) {
            return errorResponse("Assessment not found", 404);
        }

        // ---------------------------------------------------------
        // 5. Verify employee is assigned to this assessment
        // ---------------------------------------------------------
        const assignment = assessment.assignedEmployees.find(
            (item) => item.employeeId.toString() === employeeId,
        );

        if (!assignment) {
            return errorResponse(
                "Employee is not assigned to this assessment",
                404,
            );
        }

        // ---------------------------------------------------------
        // 6. Get employee
        // ---------------------------------------------------------
        //
        // Only fields that actually exist in IEmployee are selected.
        //
        const employee = await Employee.findOne({
            _id: employeeId,
            employerId: employer._id,
        })
            .select(
                "_id employeeId fullName email phoneNumber department designation",
            )
            .lean();

        if (!employee) {
            return errorResponse("Employee not found", 404);
        }

        // ---------------------------------------------------------
        // 7. Get latest attempt for this assessment + employee
        // ---------------------------------------------------------
        const attempt = await AssessmentAttempt.findOne({
            assessmentId: assessment._id,
            employeeId: employee._id,
        })
            .sort({
                createdAt: -1,
            })
            .lean();

        // ---------------------------------------------------------
        // 8. Create answer lookup
        // ---------------------------------------------------------
        type AttemptAnswer = NonNullable<typeof attempt>["answers"][number];

        const answerMap = new Map<string, AttemptAnswer>();

        if (attempt?.answers) {
            for (const answer of attempt.answers) {
                answerMap.set(answer.questionId, answer);
            }
        }

        // ---------------------------------------------------------
        // 9. Build question results
        // ---------------------------------------------------------
        const questions = assessment.questions
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((question) => {
                const submittedAnswer = answerMap.get(question.questionId);

                // -------------------------------------------------
                // MCQ correct options
                // -------------------------------------------------
                const correctOptionIds =
                    question.type === "mcq"
                        ? (question.options ?? [])
                              .filter((option) => option.isCorrect)
                              .map((option) => option.optionId)
                        : [];

                // -------------------------------------------------
                // Candidate selected options
                // -------------------------------------------------
                const selectedOptions = submittedAnswer?.selectedOptions ?? [];

                // -------------------------------------------------
                // Candidate text/code answer
                // -------------------------------------------------
                const answer = submittedAnswer?.answer ?? null;

                // -------------------------------------------------
                // MCQ correctness
                // -------------------------------------------------
                let isCorrect: boolean | null = null;

                if (question.type === "mcq") {
                    const expected = [...correctOptionIds].sort();

                    const actual = [...selectedOptions].sort();

                    isCorrect =
                        expected.length === actual.length &&
                        expected.every(
                            (optionId, index) => optionId === actual[index],
                        );
                }

                // -------------------------------------------------
                // Automatic points
                // -------------------------------------------------
                let awardedPoints: number | null = null;

                if (question.type === "mcq" && question.autoEvaluate) {
                    awardedPoints = isCorrect ? question.points : 0;
                }

                // -------------------------------------------------
                // Return question result
                // -------------------------------------------------
                return {
                    questionId: question.questionId,
                    order: question.order,

                    question: question.question,
                    type: question.type,

                    points: question.points,
                    required: question.required,

                    selectionType: question.selectionType ?? null,

                    options:
                        question.type === "mcq" ? (question.options ?? []) : [],

                    correctOptionIds,

                    // Coding configuration
                    language: question.language ?? null,

                    starterCode: question.starterCode ?? null,

                    inputDescription: question.inputDescription ?? null,

                    outputDescription: question.outputDescription ?? null,

                    constraints: question.constraints ?? null,

                    // Text / project configuration
                    minLength: question.minLength ?? null,

                    maxLength: question.maxLength ?? null,

                    answerPlaceholder: question.answerPlaceholder ?? null,

                    // Evaluation
                    autoEvaluate: question.autoEvaluate,

                    explanation: question.explanation ?? null,

                    // Candidate answer
                    answer: {
                        answer,

                        selectedOptions,

                        answeredAt: submittedAnswer?.answeredAt ?? null,

                        isCorrect,
                    },

                    // Current grading information

                    grading: {
                        awardedPoints:
                            submittedAnswer?.awardedPoints ?? awardedPoints,

                        gradingType:
                            submittedAnswer?.manuallyGraded === true
                                ? "manual"
                                : question.autoEvaluate
                                  ? "automatic"
                                  : "manual",

                        gradingNote: submittedAnswer?.gradingNote ?? null,

                        manuallyGraded:
                            submittedAnswer?.manuallyGraded === true,

                        gradedAt: submittedAnswer?.gradedAt ?? null,
                    },
                };
            });

        // ---------------------------------------------------------
        // 10. Calculate automatic score
        // ---------------------------------------------------------
        let automaticScore = 0;

        for (const question of assessment.questions) {
            if (question.type !== "mcq" || !question.autoEvaluate) {
                continue;
            }

            const submittedAnswer = answerMap.get(question.questionId);

            if (!submittedAnswer) {
                continue;
            }

            const correctOptionIds = (question.options ?? [])
                .filter((option) => option.isCorrect)
                .map((option) => option.optionId)
                .sort();

            const selectedOptions = [
                ...(submittedAnswer.selectedOptions ?? []),
            ].sort();

            const isCorrect =
                correctOptionIds.length === selectedOptions.length &&
                correctOptionIds.every(
                    (optionId, index) => optionId === selectedOptions[index],
                );

            if (isCorrect) {
                automaticScore += question.points;
            }
        }

        // ---------------------------------------------------------
        // 11. Determine whether manual grading is required
        // ---------------------------------------------------------
        const hasManualQuestions = assessment.questions.some(
            (question) => !question.autoEvaluate,
        );

        // ---------------------------------------------------------
        // 12. Determine grading status
        // ---------------------------------------------------------
        let gradingStatus:
            | "not-started"
            | "in-progress"
            | "manual-grading-required"
            | "graded"
            | "expired";

        if (!attempt) {
            gradingStatus = "not-started";
        } else if (attempt.status === "in-progress") {
            gradingStatus = "in-progress";
        } else if (attempt.status === "expired") {
            gradingStatus = "expired";
        } else if (hasManualQuestions) {
            gradingStatus = "manual-grading-required";
        } else {
            gradingStatus = "graded";
        }

        // ---------------------------------------------------------
        // 13. Return response
        // ---------------------------------------------------------
        return NextResponse.json({
            success: true,

            assessment: {
                id: assessment._id,

                title: assessment.title,

                description: assessment.description ?? null,

                instructions: assessment.instructions ?? null,

                skills: assessment.skills,

                timing: assessment.timing,

                timer: assessment.timer,

                security: assessment.security,

                totalPoints: assessment.totalPoints,

                resultSettings: assessment.resultSettings,

                status: assessment.status,
            },

            employee: {
                id: employee._id,

                employeeId: employee.employeeId,

                fullName: employee.fullName,

                email: employee.email,

                phoneNumber: employee.phoneNumber ?? null,

                department: employee.department ?? null,

                designation: employee.designation ?? null,
            },

            assignment: {
                status: assignment.status,

                assignedAt: assignment.assignedAt,

                emailSentAt: assignment.emailSentAt ?? null,

                startedAt: assignment.startedAt ?? null,

                submittedAt: assignment.submittedAt ?? null,

                shortlisted: assignment.shortlisted ?? false,
                shortlistedAt: assignment.shortlistedAt ?? null,
                shortlistEmailSentAt: assignment.shortlistEmailSentAt ?? null,
            },

            attempt: attempt
                ? {
                      id: attempt._id,

                      status: attempt.status,

                      startedAt: attempt.startedAt,

                      expiresAt: attempt.expiresAt ?? null,

                      submittedAt: attempt.submittedAt ?? null,

                      submissionType: attempt.submissionType ?? null,

                      tabChangeCount: attempt.tabChangeCount,

                      score: attempt.score ?? null,

                      percentage: attempt.percentage ?? null,

                      passed: attempt.passed ?? null,
                  }
                : null,

            grading: {
                totalPoints: assessment.totalPoints,

                automaticScore,

                currentScore: attempt?.score ?? null,

                currentPercentage: attempt?.percentage ?? null,

                passed: attempt?.passed ?? null,

                hasManualQuestions,

                gradingStatus,
            },

            questions,
        });
    } catch (error) {
        console.error(
            "GET /api/employer/assessment/[id]/results/[employeeId] error:",
            error,
        );

        return errorResponse("Failed to fetch employee assessment result", 500);
    }
}

interface GradeInput {
    questionId: string;
    awardedPoints: number;
    gradingNote?: string;
}

export async function PATCH(
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
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse("Invalid assessment ID", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return errorResponse("Invalid employee ID", 400);
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
            return errorResponse("Assessment not found", 404);
        }

        // ---------------------------------------------------------
        // 5. Verify employee assignment
        // ---------------------------------------------------------
        let assignmentFound = false;

        for (const assignment of assessment.assignedEmployees) {
            if (assignment.employeeId.toString() === employeeId) {
                assignmentFound = true;
                break;
            }
        }

        if (!assignmentFound) {
            return errorResponse(
                "Employee is not assigned to this assessment",
                404,
            );
        }

        // ---------------------------------------------------------
        // 6. Verify employee belongs to employer
        // ---------------------------------------------------------
        const employee = await Employee.findOne({
            _id: employeeId,
            employerId: employer._id,
        })
            .select("_id employeeId fullName email")
            .lean();

        if (!employee) {
            return errorResponse("Employee not found", 404);
        }

        // ---------------------------------------------------------
        // 7. Get latest attempt
        // ---------------------------------------------------------
        const attempt = await AssessmentAttempt.findOne({
            assessmentId: assessment._id,
            employeeId: employee._id,
        }).sort({
            createdAt: -1,
        });

        if (!attempt) {
            return errorResponse("Assessment attempt not found", 404);
        }

        // ---------------------------------------------------------
        // 8. Only completed / expired attempts can be graded
        // ---------------------------------------------------------
        if (attempt.status !== "completed" && attempt.status !== "expired") {
            return errorResponse(
                "Only completed or expired attempts can be graded",
                400,
            );
        }

        // ---------------------------------------------------------
        // 9. Parse request body
        // ---------------------------------------------------------
        const body: unknown = await request.json();

        if (typeof body !== "object" || body === null || !("grades" in body)) {
            return errorResponse(
                "Request body must contain a grades array",
                400,
            );
        }

        const gradesValue = (
            body as {
                grades?: unknown;
            }
        ).grades;

        if (!Array.isArray(gradesValue)) {
            return errorResponse("grades must be an array", 400);
        }

        if (gradesValue.length === 0) {
            return errorResponse("At least one grade is required", 400);
        }

        // ---------------------------------------------------------
        // 10. Validate grades
        // ---------------------------------------------------------
        const grades: GradeInput[] = [];

        for (const rawGrade of gradesValue) {
            if (typeof rawGrade !== "object" || rawGrade === null) {
                return errorResponse("Each grade must be an object", 400);
            }

            const gradeObject = rawGrade as {
                questionId?: unknown;
                awardedPoints?: unknown;
                gradingNote?: unknown;
            };

            // -----------------------------------------------------
            // questionId
            // -----------------------------------------------------
            if (typeof gradeObject.questionId !== "string") {
                return errorResponse(
                    "Each grade must contain a valid questionId",
                    400,
                );
            }

            const questionId = gradeObject.questionId.trim();

            if (!questionId) {
                return errorResponse("questionId cannot be empty", 400);
            }

            // -----------------------------------------------------
            // awardedPoints
            // -----------------------------------------------------
            if (
                typeof gradeObject.awardedPoints !== "number" ||
                !Number.isFinite(gradeObject.awardedPoints)
            ) {
                return errorResponse(
                    `Invalid awardedPoints for question ${questionId}`,
                    400,
                );
            }

            // -----------------------------------------------------
            // gradingNote
            // -----------------------------------------------------
            if (
                gradeObject.gradingNote !== undefined &&
                typeof gradeObject.gradingNote !== "string"
            ) {
                return errorResponse(
                    `gradingNote for question ${questionId} must be a string`,
                    400,
                );
            }

            grades.push({
                questionId,

                awardedPoints: gradeObject.awardedPoints,

                gradingNote: gradeObject.gradingNote,
            });
        }

        // ---------------------------------------------------------
        // 11. Build assessment question lookup
        // ---------------------------------------------------------
        const questionMap = new Map<
            string,
            (typeof assessment.questions)[number]
        >();

        for (const question of assessment.questions) {
            questionMap.set(question.questionId, question);
        }

        // ---------------------------------------------------------
        // 12. Validate each grade against assessment question
        // ---------------------------------------------------------
        const gradeMap = new Map<string, GradeInput>();

        for (const grade of grades) {
            const question = questionMap.get(grade.questionId);

            if (!question) {
                return errorResponse(
                    `Question ${grade.questionId} does not belong to this assessment`,
                    400,
                );
            }

            if (gradeMap.has(grade.questionId)) {
                return errorResponse(
                    `Duplicate grade for question ${grade.questionId}`,
                    400,
                );
            }

            if (
                grade.awardedPoints < 0 ||
                grade.awardedPoints > question.points
            ) {
                return errorResponse(
                    `Awarded points for question ${grade.questionId} must be between 0 and ${question.points}`,
                    400,
                );
            }

            gradeMap.set(grade.questionId, grade);
        }

        // ---------------------------------------------------------
        // 13. Verify submitted answers exist
        // ---------------------------------------------------------
        for (const grade of grades) {
            let answerExists = false;

            for (const answer of attempt.answers) {
                if (answer.questionId === grade.questionId) {
                    answerExists = true;
                    break;
                }
            }

            if (!answerExists) {
                return errorResponse(
                    `No submitted answer exists for question ${grade.questionId}`,
                    400,
                );
            }
        }

        // ---------------------------------------------------------
        // 14. Apply employer grades
        // ---------------------------------------------------------
        for (const answer of attempt.answers) {
            const grade = gradeMap.get(answer.questionId);

            if (!grade) {
                continue;
            }

            answer.awardedPoints = grade.awardedPoints;

            answer.manuallyGraded = true;

            answer.gradedAt = new Date();

            if (grade.gradingNote !== undefined) {
                answer.gradingNote = grade.gradingNote;
            }
        }

        // ---------------------------------------------------------
        // 15. Calculate final score
        // ---------------------------------------------------------
        let score = 0;

        for (const question of assessment.questions) {
            let answer: (typeof attempt.answers)[number] | undefined;

            for (const attemptAnswer of attempt.answers) {
                if (attemptAnswer.questionId === question.questionId) {
                    answer = attemptAnswer;
                    break;
                }
            }

            if (!answer) {
                continue;
            }

            // -----------------------------------------------------
            // Employer grade has highest priority
            // -----------------------------------------------------
            if (
                answer.manuallyGraded === true &&
                typeof answer.awardedPoints === "number"
            ) {
                score += answer.awardedPoints;

                continue;
            }

            // -----------------------------------------------------
            // Automatic MCQ grading
            // -----------------------------------------------------
            if (question.type === "mcq" && question.autoEvaluate) {
                const correctOptionIds: string[] = [];

                for (const option of question.options ?? []) {
                    if (option.isCorrect) {
                        correctOptionIds.push(option.optionId);
                    }
                }

                const selectedOptions = [...(answer.selectedOptions ?? [])];

                correctOptionIds.sort();
                selectedOptions.sort();

                let isCorrect =
                    correctOptionIds.length === selectedOptions.length;

                if (isCorrect) {
                    for (
                        let index = 0;
                        index < correctOptionIds.length;
                        index++
                    ) {
                        if (
                            correctOptionIds[index] !== selectedOptions[index]
                        ) {
                            isCorrect = false;
                            break;
                        }
                    }
                }

                if (isCorrect) {
                    score += question.points;
                }
            }
        }

        // ---------------------------------------------------------
        // 16. Calculate percentage
        // ---------------------------------------------------------
        const percentage =
            assessment.totalPoints > 0
                ? Number(((score / assessment.totalPoints) * 100).toFixed(2))
                : 0;

        // ---------------------------------------------------------
        // 17. Save attempt
        // ---------------------------------------------------------
        attempt.score = score;
        attempt.percentage = percentage;

        await attempt.save();

        // ---------------------------------------------------------
        // 18. Check whether all manual questions are graded
        // ---------------------------------------------------------
        let allManualQuestionsGraded = true;

        for (const question of assessment.questions) {
            if (question.autoEvaluate) {
                continue;
            }

            let answer: (typeof attempt.answers)[number] | undefined;

            for (const attemptAnswer of attempt.answers) {
                if (attemptAnswer.questionId === question.questionId) {
                    answer = attemptAnswer;
                    break;
                }
            }

            if (
                !answer ||
                answer.manuallyGraded !== true ||
                typeof answer.awardedPoints !== "number"
            ) {
                allManualQuestionsGraded = false;

                break;
            }
        }

        // ---------------------------------------------------------
        // 19. Return result
        // ---------------------------------------------------------
        return NextResponse.json({
            success: true,

            message: "Assessment grading updated successfully",

            grading: {
                score,

                percentage,

                totalPoints: assessment.totalPoints,

                gradingStatus: allManualQuestionsGraded
                    ? "graded"
                    : "manual-grading-required",

                allManualQuestionsGraded,
            },

            attempt: {
                id: attempt._id,

                status: attempt.status,

                score: attempt.score,

                percentage: attempt.percentage,

                passed: attempt.passed ?? null,

                submittedAt: attempt.submittedAt ?? null,

                submissionType: attempt.submissionType ?? null,
            },
        });
    } catch (error) {
        console.error(
            "PATCH /api/employer/assessment/[id]/results/[employeeId] error:",
            error,
        );

        return errorResponse("Failed to update assessment grading", 500);
    }
}
