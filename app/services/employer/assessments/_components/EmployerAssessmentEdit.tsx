"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock3,
    Code2,
    FileText,
    ListChecks,
    Plus,
    Save,
    ShieldCheck,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAssessment } from "@/hooks/queries/useAssessment";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type AssessmentStatus = "draft" | "published" | "closed" | "archived";

type QuestionType =
    | "short-text"
    | "long-text"
    | "coding"
    | "project-report"
    | "mcq";

type SelectionType = "single" | "multiple";

interface OptionState {
    optionId: string;
    text: string;
    isCorrect: boolean;
}

interface QuestionState {
    questionId: string;
    order: number;
    question: string;
    type: QuestionType;
    points: number;
    required: boolean;

    selectionType?: SelectionType;
    options?: OptionState[];

    language?: string;
    starterCode?: string;
    inputDescription?: string;
    outputDescription?: string;
    constraints?: string;

    minLength?: number;
    maxLength?: number;
    answerPlaceholder?: string;

    autoEvaluate?: boolean;
    explanation?: string;
}

interface AssignedEmployee {
    employeeId:
        | string
        | {
              _id?: string;
              employeeId?: string;
              fullName?: string;
              email?: string;
          };

    assignedAt: string;

    emailSentAt?: string;

    status: "assigned" | "in-progress" | "completed" | "expired";

    startedAt?: string;
    submittedAt?: string;
}

interface Assessment {
    _id: string;
    title: string;
    description?: string;
    instructions?: string;

    skills: string[];

    timing: {
        startAt: string;
        endAt: string;
        durationMinutes: number;
    };

    timer: {
        enabled: boolean;
        autoSubmitOnExpiry: boolean;
    };

    security: {
        trackTabChanges: boolean;
        maxTabChanges?: number;
    };

    questions: QuestionState[];

    assignedEmployees: AssignedEmployee[];

    totalPoints: number;

    resultSettings: {
        showResultToEmployee: boolean;
        showCorrectAnswersToEmployee: boolean;
    };

    status: AssessmentStatus;

    createdAt: string;
    updatedAt: string;
}

interface EmployerAssessmentResponse {
    success: boolean;
    assessment: Assessment;
}

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const inputClass =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

const textareaClass =
    "min-h-28 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

const questionTypeLabels: Record<QuestionType, string> = {
    "short-text": "Short text",
    "long-text": "Long text",
    coding: "Coding",
    "project-report": "Project report",
    mcq: "Multiple choice",
};

const questionTypeIcons: Record<QuestionType, typeof FileText> = {
    "short-text": FileText,
    "long-text": FileText,
    coding: Code2,
    "project-report": FileText,
    mcq: ListChecks,
};

const defaultSkills = [
    "Python",
    "React",
    "SQL",
    "Java",
    "C#",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Communication",
];

const createQuestion = (type: QuestionType = "short-text"): QuestionState => {
    const base: QuestionState = {
        questionId: crypto.randomUUID(),
        order: 1,
        question: "",
        type,
        points: 10,
        required: true,
        autoEvaluate: false,
    };

    if (type === "mcq") {
        return {
            ...base,
            selectionType: "single",
            options: [
                {
                    optionId: crypto.randomUUID(),
                    text: "",
                    isCorrect: false,
                },
                {
                    optionId: crypto.randomUUID(),
                    text: "",
                    isCorrect: false,
                },
            ],
        };
    }

    if (type === "coding") {
        return {
            ...base,
            language: "javascript",
            starterCode: "",
            inputDescription: "",
            outputDescription: "",
            constraints: "",
            autoEvaluate: false,
        };
    }

    return base;
};

/*
 * ============================================================
 * NORMALIZERS
 * ============================================================
 */

function toDateTimeLocal(value?: string) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const offset = date.getTimezoneOffset();

    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
}

function normalizeQuestion(question: QuestionState): QuestionState {
    return {
        questionId: question.questionId || crypto.randomUUID(),
        order: question.order,
        question: question.question ?? "",
        type: question.type,
        points: question.points ?? 10,
        required: question.required ?? true,

        selectionType: question.selectionType,

        options: question.options?.map((option) => ({
            optionId: option.optionId || crypto.randomUUID(),
            text: option.text ?? "",
            isCorrect: option.isCorrect ?? false,
        })),

        language: question.language,
        starterCode: question.starterCode,
        inputDescription: question.inputDescription,
        outputDescription: question.outputDescription,
        constraints: question.constraints,

        minLength: question.minLength,
        maxLength: question.maxLength,
        answerPlaceholder: question.answerPlaceholder,

        autoEvaluate: question.autoEvaluate ?? false,
        explanation: question.explanation,
    };
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function EmployerAssessmentEdit({
    assessmentId,
}: {
    assessmentId: string;
}) {
    const router = useRouter();

    const {
        employerAssessment,
        isEmployerAssessmentLoading,
        isEmployerAssessmentFetching,
        employerAssessmentError,
        updateAssessment,
        isUpdatingAssessment,
        updateAssessmentError,
    } = useAssessment({
        role: "employer",
        assessmentId,
    });

    /*
     * ----------------------------------------------------------
     * FORM STATE
     * ----------------------------------------------------------
     */

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [instructions, setInstructions] = useState("");

    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const [customSkill, setCustomSkill] = useState("");
    const [showCustomSkill, setShowCustomSkill] = useState(false);

    const [questions, setQuestions] = useState<QuestionState[]>([]);

    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(60);

    const [timerEnabled, setTimerEnabled] = useState(true);

    const [autoSubmitOnExpiry, setAutoSubmitOnExpiry] = useState(true);

    const [trackTabChanges, setTrackTabChanges] = useState(false);

    const [maxTabChanges, setMaxTabChanges] = useState<number | "">("");

    const [showResultToEmployee, setShowResultToEmployee] = useState(false);

    const [showCorrectAnswersToEmployee, setShowCorrectAnswersToEmployee] =
        useState(false);

    const [assessmentStatus, setAssessmentStatus] =
        useState<AssessmentStatus>("published");

    /*
     * ----------------------------------------------------------
     * UI STATE
     * ----------------------------------------------------------
     */

    const [openQuestion, setOpenQuestion] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const [initialized, setInitialized] = useState(false);

    /*
     * ==========================================================
     * LOAD ASSESSMENT INTO FORM
     * ==========================================================
     */

    useEffect(() => {
        if (initialized || !employerAssessment) {
            return;
        }

        const response = employerAssessment as
            | EmployerAssessmentResponse
            | Assessment;

        const assessment =
            "assessment" in response ? response.assessment : response;

        if (!assessment) {
            return;
        }

        setTitle(assessment.title ?? "");
        setDescription(assessment.description ?? "");
        setInstructions(assessment.instructions ?? "");

        setSelectedSkills(
            Array.isArray(assessment.skills) ? assessment.skills : [],
        );

        setQuestions(
            Array.isArray(assessment.questions) &&
                assessment.questions.length > 0
                ? assessment.questions
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map(normalizeQuestion)
                : [createQuestion()],
        );

        setStartAt(toDateTimeLocal(assessment.timing?.startAt));

        setEndAt(toDateTimeLocal(assessment.timing?.endAt));

        setDurationMinutes(assessment.timing?.durationMinutes ?? 60);

        setTimerEnabled(assessment.timer?.enabled ?? true);

        setAutoSubmitOnExpiry(assessment.timer?.autoSubmitOnExpiry ?? true);

        setTrackTabChanges(assessment.security?.trackTabChanges ?? false);

        setMaxTabChanges(assessment.security?.maxTabChanges ?? "");

        setShowResultToEmployee(
            assessment.resultSettings?.showResultToEmployee ?? false,
        );

        setShowCorrectAnswersToEmployee(
            assessment.resultSettings?.showCorrectAnswersToEmployee ?? false,
        );

        setAssessmentStatus(assessment.status ?? "published");

        setInitialized(true);
    }, [employerAssessment, initialized]);

    /*
     * ==========================================================
     * SKILLS
     * ==========================================================
     */

    const toggleSkill = (skill: string) => {
        setSelectedSkills((current) =>
            current.includes(skill)
                ? current.filter((value) => value !== skill)
                : [...current, skill],
        );
    };

    const addCustomSkill = () => {
        const skill = customSkill.trim();

        if (!skill) {
            return;
        }

        if (
            !selectedSkills.some(
                (value) => value.toLowerCase() === skill.toLowerCase(),
            )
        ) {
            setSelectedSkills((current) => [...current, skill]);
        }

        setCustomSkill("");
        setShowCustomSkill(false);
    };

    /*
     * ==========================================================
     * QUESTIONS
     * ==========================================================
     */

    const addQuestion = (type: QuestionType = "short-text") => {
        const question = createQuestion(type);

        setQuestions((current) => {
            const next = [...current, question];

            setOpenQuestion(next.length - 1);

            return next;
        });
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) {
            return;
        }

        setQuestions((current) =>
            current.filter((_, questionIndex) => questionIndex !== index),
        );

        setOpenQuestion((current) =>
            Math.max(0, Math.min(current, questions.length - 2)),
        );
    };

    const updateQuestion = (index: number, updates: Partial<QuestionState>) => {
        setQuestions((current) =>
            current.map((question, questionIndex) =>
                questionIndex === index
                    ? {
                          ...question,
                          ...updates,
                      }
                    : question,
            ),
        );
    };

    const addOption = (questionIndex: number) => {
        setQuestions((current) =>
            current.map((question, index) => {
                if (index !== questionIndex) {
                    return question;
                }

                return {
                    ...question,
                    options: [
                        ...(question.options ?? []),
                        {
                            optionId: crypto.randomUUID(),
                            text: "",
                            isCorrect: false,
                        },
                    ],
                };
            }),
        );
    };

    const updateOption = (
        questionIndex: number,
        optionIndex: number,
        updates: Partial<OptionState>,
    ) => {
        setQuestions((current) =>
            current.map((question, index) => {
                if (index !== questionIndex) {
                    return question;
                }

                return {
                    ...question,
                    options: (question.options ?? []).map(
                        (option, currentOptionIndex) =>
                            currentOptionIndex === optionIndex
                                ? {
                                      ...option,
                                      ...updates,
                                  }
                                : option,
                    ),
                };
            }),
        );
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        setQuestions((current) =>
            current.map((question, index) => {
                if (index !== questionIndex) {
                    return question;
                }

                if ((question.options ?? []).length <= 2) {
                    return question;
                }

                return {
                    ...question,
                    options: (question.options ?? []).filter(
                        (_, currentOptionIndex) =>
                            currentOptionIndex !== optionIndex,
                    ),
                };
            }),
        );
    };

    const changeQuestionType = (index: number, type: QuestionType) => {
        const currentQuestion = questions[index];

        const nextQuestion = createQuestion(type);

        setQuestions((current) =>
            current.map((question, questionIndex) =>
                questionIndex === index
                    ? {
                          ...nextQuestion,
                          question: currentQuestion.question,
                          points: currentQuestion.points,
                          required: currentQuestion.required,
                      }
                    : question,
            ),
        );
    };

    /*
     * ==========================================================
     * VALIDATION
     * ==========================================================
     */

    const validateForm = () => {
        if (!title.trim()) {
            return "Assessment title is required.";
        }

        if (selectedSkills.length === 0) {
            return "Select at least one skill.";
        }

        if (questions.length === 0) {
            return "Add at least one question.";
        }

        for (let index = 0; index < questions.length; index += 1) {
            const question = questions[index];

            if (!question.question.trim()) {
                return `Question ${index + 1} cannot be empty.`;
            }

            if (!Number.isInteger(question.points) || question.points <= 0) {
                return `Question ${index + 1} must have at least 1 point.`;
            }

            if (question.type === "mcq") {
                const options = question.options ?? [];

                if (options.length < 2) {
                    return `Question ${
                        index + 1
                    } must have at least two options.`;
                }

                if (options.some((option) => !option.text.trim())) {
                    return `All options in question ${
                        index + 1
                    } must have text.`;
                }

                const correctOptions = options.filter(
                    (option) => option.isCorrect,
                );

                if (correctOptions.length === 0) {
                    return `Question ${
                        index + 1
                    } must have at least one correct option.`;
                }

                if (
                    question.selectionType === "single" &&
                    correctOptions.length !== 1
                ) {
                    return `Question ${
                        index + 1
                    } must have exactly one correct option.`;
                }
            }

            if (
                question.minLength !== undefined &&
                question.maxLength !== undefined &&
                question.minLength > question.maxLength
            ) {
                return `Question ${
                    index + 1
                } has an invalid character length range.`;
            }
        }

        if (!startAt) {
            return "Assessment start time is required.";
        }

        if (!endAt) {
            return "Assessment end time is required.";
        }

        const start = new Date(startAt);
        const end = new Date(endAt);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return "Please provide valid assessment dates.";
        }

        if (end <= start) {
            return "Assessment end time must be after the start time.";
        }

        if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
            return "Duration must be a positive whole number.";
        }

        return null;
    };

    /*
     * ==========================================================
     * SUBMIT
     * ==========================================================
     */

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setErrorMessage("");

        const validationError = validateForm();

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        try {
            const payload = {
                title: title.trim(),

                description: description.trim(),

                instructions: instructions.trim(),

                skills: selectedSkills,

                timing: {
                    startAt: new Date(startAt).toISOString(),

                    endAt: new Date(endAt).toISOString(),

                    durationMinutes,
                },

                timer: {
                    enabled: timerEnabled,
                    autoSubmitOnExpiry,
                },

                security: {
                    trackTabChanges,

                    ...(trackTabChanges && maxTabChanges !== ""
                        ? {
                              maxTabChanges,
                          }
                        : {}),
                },

                questions: questions.map((question, index) => ({
                    questionId: question.questionId,

                    order: index + 1,

                    question: question.question.trim(),

                    type: question.type,

                    points: question.points,

                    required: question.required,

                    ...(question.type === "mcq" && {
                        selectionType: question.selectionType,

                        options: (question.options ?? []).map((option) => ({
                            optionId: option.optionId,

                            text: option.text.trim(),

                            isCorrect: option.isCorrect,
                        })),
                    }),

                    ...(question.type === "coding" && {
                        language: question.language,

                        starterCode: question.starterCode,

                        inputDescription: question.inputDescription,

                        outputDescription: question.outputDescription,

                        constraints: question.constraints,
                    }),

                    ...((question.type === "short-text" ||
                        question.type === "long-text" ||
                        question.type === "project-report") && {
                        ...(question.minLength !== undefined && {
                            minLength: question.minLength,
                        }),

                        ...(question.maxLength !== undefined && {
                            maxLength: question.maxLength,
                        }),

                        ...(question.answerPlaceholder && {
                            answerPlaceholder: question.answerPlaceholder,
                        }),
                    }),

                    ...(question.autoEvaluate !== undefined && {
                        autoEvaluate: question.autoEvaluate,
                    }),

                    ...(question.explanation && {
                        explanation: question.explanation,
                    }),
                })),

                resultSettings: {
                    showResultToEmployee,

                    showCorrectAnswersToEmployee,
                },

                status: assessmentStatus,
            };

            await updateAssessment({
                assessmentId,
                payload,
            });

            router.push(
                `/services/employer/assessments/${assessmentId}?updated=true`,
            );
        } catch (error) {
            const responseMessage = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                }
            )?.response?.data?.message;

            setErrorMessage(
                responseMessage ||
                    "Unable to update the assessment. Please try again.",
            );
        }
    };

    /*
     * ==========================================================
     * LOADING
     * ==========================================================
     */

    if (isEmployerAssessmentLoading) {
        return (
            <div className="space-y-5">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="animate-pulse rounded-2xl border border-border bg-card p-6"
                    >
                        <div className="h-5 w-1/3 rounded bg-muted" />

                        <div className="mt-4 h-11 rounded bg-muted" />

                        <div className="mt-4 h-20 rounded bg-muted" />
                    </div>
                ))}
            </div>
        );
    }

    /*
     * ==========================================================
     * ERROR
     * ==========================================================
     */

    if (employerAssessmentError || !initialized) {
        return (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="size-5" />
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                    Unable to load assessment
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    The assessment could not be loaded. Please return to the
                    assessment and try again.
                </p>

                <Button asChild className="mt-5">
                    <Link
                        href={`/services/employer/assessments/${assessmentId}`}
                    >
                        Back to assessment
                    </Link>
                </Button>
            </div>
        );
    }

    /*
     * ==========================================================
     * CANDIDATE
     * ==========================================================
     */

    const assessmentResponse = employerAssessment as
        | EmployerAssessmentResponse
        | Assessment;

    const assessment =
        "assessment" in assessmentResponse
            ? assessmentResponse.assessment
            : assessmentResponse;

    const assignedEmployee = assessment.assignedEmployees?.[0];

    /*
     * ==========================================================
     * RENDER
     * ==========================================================
     */

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}

            {updateAssessmentError && !errorMessage && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Unable to update the assessment. Please check your
                    information and try again.
                </div>
            )}

            {/* ==================================================
                CANDIDATE
            ================================================== */}

            <Section
                icon={UserRound}
                title="Candidate"
                description="The assigned candidate is shown here for reference. Candidate assignment is not changed from this edit form."
            >
                {assignedEmployee ? (
                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {getEmployeeInitial(assignedEmployee)}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                                {getEmployeeName(assignedEmployee)}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                                {getEmployeeEmail(assignedEmployee)}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Assignment status: {assignedEmployee.status}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No candidate is currently assigned.
                    </p>
                )}
            </Section>

            {/* ==================================================
                DETAILS
            ================================================== */}

            <Section
                icon={FileText}
                title="Assessment details"
                description="Update the information shown to the candidate."
            >
                <div className="space-y-5">
                    <Field
                        label="Assessment title"
                        placeholder="e.g. Frontend Developer Assessment"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                    />

                    <TextAreaField
                        label="Description"
                        placeholder="Briefly describe the purpose and focus of this assessment."
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />

                    <TextAreaField
                        label="Instructions"
                        placeholder="Explain how the candidate should approach the assessment."
                        value={instructions}
                        onChange={(event) =>
                            setInstructions(event.target.value)
                        }
                    />
                </div>
            </Section>

            {/* ==================================================
                SKILLS
            ================================================== */}

            <Section
                icon={CheckCircle2}
                title="Skills"
                description="Update the skills this assessment evaluates."
                right={
                    <span className="text-sm font-medium text-primary">
                        {selectedSkills.length} selected
                    </span>
                }
            >
                <div className="flex flex-wrap gap-2">
                    {defaultSkills.map((skill) => {
                        const selected = selectedSkills.includes(skill);

                        return (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                                    selected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border hover:border-primary/40"
                                }`}
                            >
                                {selected && (
                                    <CheckCircle2 className="mr-1 inline size-3.5" />
                                )}

                                {skill}
                            </button>
                        );
                    })}

                    {selectedSkills
                        .filter((skill) => !defaultSkills.includes(skill))
                        .map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className="rounded-full border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                            >
                                {skill}

                                <X className="ml-1 inline size-3.5" />
                            </button>
                        ))}

                    <button
                        type="button"
                        onClick={() =>
                            setShowCustomSkill((current) => !current)
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                        <Plus className="size-3.5" />
                        Custom skill
                    </button>
                </div>

                <AnimatePresence>
                    {showCustomSkill && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                height: 0,
                            }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                            }}
                            className="mt-4 overflow-hidden"
                        >
                            <div className="flex gap-2">
                                <input
                                    className={inputClass}
                                    placeholder="Enter custom skill"
                                    value={customSkill}
                                    onChange={(event) =>
                                        setCustomSkill(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            addCustomSkill();
                                        }
                                    }}
                                />

                                <Button type="button" onClick={addCustomSkill}>
                                    Add
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Section>

            {/* ==================================================
                QUESTIONS
            ================================================== */}

            <Section
                icon={ListChecks}
                title="Questions"
                description="Update the questions, answer options, points, and question-specific configuration."
                right={
                    <span className="text-sm font-medium text-primary">
                        {questions.length}{" "}
                        {questions.length === 1 ? "question" : "questions"}
                    </span>
                }
            >
                <div className="space-y-3">
                    {questions.map((question, index) => {
                        const Icon = questionTypeIcons[question.type];

                        const isOpen = openQuestion === index;

                        return (
                            <div
                                key={question.questionId}
                                className="overflow-hidden rounded-xl border border-border"
                            >
                                <div className="flex items-center gap-3 bg-muted/25 px-4 py-3">
                                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                                        {index + 1}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {question.question ||
                                                "Untitled question"}
                                        </p>

                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                            <Icon className="size-3.5" />
                                            {questionTypeLabels[question.type]}
                                            <span>•</span>
                                            {question.points} points
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenQuestion(isOpen ? -1 : index)
                                        }
                                        className="grid size-8 place-items-center rounded-lg hover:bg-background"
                                    >
                                        {isOpen ? (
                                            <ChevronUp className="size-4" />
                                        ) : (
                                            <ChevronDown className="size-4" />
                                        )}
                                    </button>
                                </div>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-5 border-t border-border p-4">
                                                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                                                    <label className="block">
                                                        <span className="mb-2 block text-sm font-medium">
                                                            Question
                                                        </span>

                                                        <textarea
                                                            className={`${textareaClass} min-h-24`}
                                                            placeholder="Write the question..."
                                                            value={
                                                                question.question
                                                            }
                                                            onChange={(event) =>
                                                                updateQuestion(
                                                                    index,
                                                                    {
                                                                        question:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <div className="space-y-4">
                                                        <label className="block">
                                                            <span className="mb-2 block text-sm font-medium">
                                                                Question type
                                                            </span>

                                                            <select
                                                                className={
                                                                    inputClass
                                                                }
                                                                value={
                                                                    question.type
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    changeQuestionType(
                                                                        index,
                                                                        event
                                                                            .target
                                                                            .value as QuestionType,
                                                                    )
                                                                }
                                                            >
                                                                {Object.entries(
                                                                    questionTypeLabels,
                                                                ).map(
                                                                    ([
                                                                        value,
                                                                        label,
                                                                    ]) => (
                                                                        <option
                                                                            key={
                                                                                value
                                                                            }
                                                                            value={
                                                                                value
                                                                            }
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </label>

                                                        <label className="block">
                                                            <span className="mb-2 block text-sm font-medium">
                                                                Points
                                                            </span>

                                                            <input
                                                                className={
                                                                    inputClass
                                                                }
                                                                type="number"
                                                                min={1}
                                                                value={
                                                                    question.points
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateQuestion(
                                                                        index,
                                                                        {
                                                                            points: Number(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <label className="inline-flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            question.required
                                                        }
                                                        onChange={(event) =>
                                                            updateQuestion(
                                                                index,
                                                                {
                                                                    required:
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                },
                                                            )
                                                        }
                                                        className="size-4 rounded border-border accent-primary"
                                                    />
                                                    Required question
                                                </label>

                                                {/* MCQ */}

                                                {question.type === "mcq" && (
                                                    <MCQEditor
                                                        question={question}
                                                        questionIndex={index}
                                                        updateQuestion={
                                                            updateQuestion
                                                        }
                                                        updateOption={
                                                            updateOption
                                                        }
                                                        addOption={addOption}
                                                        removeOption={
                                                            removeOption
                                                        }
                                                    />
                                                )}

                                                {/* CODING */}

                                                {question.type === "coding" && (
                                                    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <Field
                                                                label="Language"
                                                                placeholder="e.g. javascript"
                                                                value={
                                                                    question.language ??
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateQuestion(
                                                                        index,
                                                                        {
                                                                            language:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />

                                                            <Field
                                                                label="Input description"
                                                                placeholder="Describe the input..."
                                                                value={
                                                                    question.inputDescription ??
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateQuestion(
                                                                        index,
                                                                        {
                                                                            inputDescription:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <TextAreaField
                                                            label="Starter code"
                                                            placeholder="Optional starter code..."
                                                            value={
                                                                question.starterCode ??
                                                                ""
                                                            }
                                                            onChange={(event) =>
                                                                updateQuestion(
                                                                    index,
                                                                    {
                                                                        starterCode:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                        />

                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <TextAreaField
                                                                label="Output description"
                                                                placeholder="Describe the expected output..."
                                                                value={
                                                                    question.outputDescription ??
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateQuestion(
                                                                        index,
                                                                        {
                                                                            outputDescription:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />

                                                            <TextAreaField
                                                                label="Constraints"
                                                                placeholder="Describe constraints..."
                                                                value={
                                                                    question.constraints ??
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateQuestion(
                                                                        index,
                                                                        {
                                                                            constraints:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* TEXT */}

                                                {(
                                                    [
                                                        "short-text",
                                                        "long-text",
                                                        "project-report",
                                                    ] as QuestionType[]
                                                ).includes(question.type) && (
                                                    <div className="grid gap-4 sm:grid-cols-3">
                                                        <NumberField
                                                            label="Minimum length"
                                                            value={
                                                                question.minLength ??
                                                                ""
                                                            }
                                                            onChange={(value) =>
                                                                updateQuestion(
                                                                    index,
                                                                    {
                                                                        minLength:
                                                                            value ===
                                                                            ""
                                                                                ? undefined
                                                                                : value,
                                                                    },
                                                                )
                                                            }
                                                        />

                                                        <NumberField
                                                            label="Maximum length"
                                                            value={
                                                                question.maxLength ??
                                                                ""
                                                            }
                                                            onChange={(value) =>
                                                                updateQuestion(
                                                                    index,
                                                                    {
                                                                        maxLength:
                                                                            value ===
                                                                            ""
                                                                                ? undefined
                                                                                : value,
                                                                    },
                                                                )
                                                            }
                                                        />

                                                        <Field
                                                            label="Answer placeholder"
                                                            placeholder="Optional hint"
                                                            value={
                                                                question.answerPlaceholder ??
                                                                ""
                                                            }
                                                            onChange={(event) =>
                                                                updateQuestion(
                                                                    index,
                                                                    {
                                                                        answerPlaceholder:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex justify-end border-t border-border pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeQuestion(
                                                                index,
                                                            )
                                                        }
                                                        disabled={
                                                            questions.length ===
                                                            1
                                                        }
                                                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Remove question
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => addQuestion("short-text")}
                    >
                        <Plus className="mr-1.5 size-4" />
                        Add question
                    </Button>

                    <select
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                        value=""
                        onChange={(event) => {
                            if (event.target.value) {
                                addQuestion(event.target.value as QuestionType);

                                event.target.value = "";
                            }
                        }}
                    >
                        <option value="">Add specific type...</option>

                        {Object.entries(questionTypeLabels).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ),
                        )}
                    </select>
                </div>
            </Section>

            {/* ==================================================
                SCHEDULE
            ================================================== */}

            <Section
                icon={Clock3}
                title="Schedule & timing"
                description="Update when the candidate can access the assessment and how long the attempt lasts."
            >
                <div className="grid gap-5 sm:grid-cols-3">
                    <DateTimeField
                        label="Starts"
                        value={startAt}
                        onChange={setStartAt}
                        required
                    />

                    <DateTimeField
                        label="Ends"
                        value={endAt}
                        onChange={setEndAt}
                        required
                    />

                    <NumberField
                        label="Duration (minutes)"
                        value={durationMinutes}
                        onChange={(value) =>
                            setDurationMinutes(Number(value || 0))
                        }
                    />
                </div>
            </Section>

            {/* ==================================================
                TIMER
            ================================================== */}

            <Section
                icon={Clock3}
                title="Timer"
                description="Control the attempt timer independently from the assessment availability window."
            >
                <ToggleRow
                    label="Enable assessment timer"
                    description="The server calculates the authoritative attempt expiry time."
                    checked={timerEnabled}
                    onChange={setTimerEnabled}
                />

                {timerEnabled && (
                    <div className="mt-3 border-t border-border pt-3">
                        <ToggleRow
                            label="Auto-submit on expiry"
                            description="Automatically finalize the attempt when its server-side time expires."
                            checked={autoSubmitOnExpiry}
                            onChange={setAutoSubmitOnExpiry}
                        />
                    </div>
                )}
            </Section>

            {/* ==================================================
                SECURITY
            ================================================== */}

            <Section
                icon={ShieldCheck}
                title="Security"
                description="Track assessment tab changes without automatically penalizing the candidate."
            >
                <ToggleRow
                    label="Track tab changes"
                    description="Record when the candidate leaves the assessment tab."
                    checked={trackTabChanges}
                    onChange={setTrackTabChanges}
                />

                {trackTabChanges && (
                    <div className="mt-4 max-w-xs">
                        <NumberField
                            label="Maximum tab changes"
                            value={maxTabChanges}
                            onChange={setMaxTabChanges}
                        />

                        <p className="mt-1.5 text-xs text-muted-foreground">
                            This value is recorded as an assessment setting.
                            Reaching it does not automatically submit or block
                            the attempt.
                        </p>
                    </div>
                )}
            </Section>

            {/* ==================================================
                RESULTS
            ================================================== */}

            <Section
                icon={CheckCircle2}
                title="Results"
                description="Choose what the candidate can see after submitting."
            >
                <ToggleRow
                    label="Show result to employee"
                    description="Allow the employee to see their result after submission."
                    checked={showResultToEmployee}
                    onChange={setShowResultToEmployee}
                />

                <div className="mt-3 border-t border-border pt-3">
                    <ToggleRow
                        label="Show correct answers"
                        description="Allow the employee to see correct answers after submission."
                        checked={showCorrectAnswersToEmployee}
                        onChange={setShowCorrectAnswersToEmployee}
                    />
                </div>
            </Section>

            {/* ==================================================
                STATUS
            ================================================== */}

            <Section
                icon={ShieldCheck}
                title="Assessment status"
                description="Change the current lifecycle state of this assessment."
            >
                <select
                    className={`${inputClass} max-w-sm`}
                    value={assessmentStatus}
                    onChange={(event) =>
                        setAssessmentStatus(
                            event.target.value as AssessmentStatus,
                        )
                    }
                >
                    <option value="draft">Draft</option>

                    <option value="published">Published</option>

                    <option value="closed">Closed</option>

                    <option value="archived">Archived</option>
                </select>
            </Section>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                        {questions.reduce(
                            (total, question) => total + question.points,
                            0,
                        )}{" "}
                        points
                    </span>{" "}
                    across {questions.length}{" "}
                    {questions.length === 1 ? "question" : "questions"}
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                        disabled={isUpdatingAssessment}
                    >
                        <Link
                            href={`/services/employer/assessments/${assessmentId}`}
                        >
                            Cancel
                        </Link>
                    </Button>

                    <Button
                        type="submit"
                        disabled={
                            isUpdatingAssessment || isEmployerAssessmentFetching
                        }
                    >
                        {isUpdatingAssessment ? (
                            <>
                                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 size-4" />
                                Save changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}

/*
 * ============================================================
 * MCQ EDITOR
 * ============================================================
 */

function MCQEditor({
    question,
    questionIndex,
    updateQuestion,
    updateOption,
    addOption,
    removeOption,
}: {
    question: QuestionState;
    questionIndex: number;
    updateQuestion: (index: number, updates: Partial<QuestionState>) => void;
    updateOption: (
        questionIndex: number,
        optionIndex: number,
        updates: Partial<OptionState>,
    ) => void;
    addOption: (questionIndex: number) => void;
    removeOption: (questionIndex: number, optionIndex: number) => void;
}) {
    return (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">Answer options</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Mark the correct option(s). Correct answers are retained
                        for employer evaluation.
                    </p>
                </div>

                <select
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    value={question.selectionType ?? "single"}
                    onChange={(event) =>
                        updateQuestion(questionIndex, {
                            selectionType: event.target.value as SelectionType,
                        })
                    }
                >
                    <option value="single">Single select</option>

                    <option value="multiple">Multiple select</option>
                </select>
            </div>

            <div className="mt-4 space-y-2">
                {(question.options ?? []).map((option, optionIndex) => (
                    <div
                        key={option.optionId}
                        className="flex items-center gap-2"
                    >
                        <input
                            type={
                                question.selectionType === "multiple"
                                    ? "checkbox"
                                    : "radio"
                            }
                            name={`correct-option-${question.questionId}`}
                            checked={option.isCorrect}
                            onChange={() => {
                                if (question.selectionType === "single") {
                                    updateQuestion(questionIndex, {
                                        options: (question.options ?? []).map(
                                            (currentOption) => ({
                                                ...currentOption,
                                                isCorrect:
                                                    currentOption.optionId ===
                                                    option.optionId,
                                            }),
                                        ),
                                    });
                                } else {
                                    updateOption(questionIndex, optionIndex, {
                                        isCorrect: !option.isCorrect,
                                    });
                                }
                            }}
                            className="size-4 accent-primary"
                        />

                        <input
                            className={inputClass}
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(event) =>
                                updateOption(questionIndex, optionIndex, {
                                    text: event.target.value,
                                })
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                removeOption(questionIndex, optionIndex)
                            }
                            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => addOption(questionIndex)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
                <Plus className="size-4" />
                Add option
            </button>
        </div>
    );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function getEmployeeName(employee: AssignedEmployee) {
    if (typeof employee.employeeId === "object") {
        return (
            employee.employeeId.fullName ||
            employee.employeeId.email ||
            employee.employeeId.employeeId ||
            employee.employeeId._id ||
            "Candidate"
        );
    }

    return employee.employeeId;
}

function getEmployeeEmail(employee: AssignedEmployee) {
    if (typeof employee.employeeId === "object") {
        return employee.employeeId.email || "—";
    }

    return "—";
}

function getEmployeeInitial(employee: AssignedEmployee) {
    const name = getEmployeeName(employee);

    return name.charAt(0).toUpperCase();
}

/*
 * ============================================================
 * SECTION
 * ============================================================
 */

function Section({
    icon: Icon,
    title,
    description,
    right,
    children,
}: {
    icon: typeof FileText;
    title: string;
    description: string;
    right?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                    <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4.5" />
                    </div>

                    <div>
                        <h2 className="font-semibold">{title}</h2>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                {right}
            </div>

            <div className="mt-5">{children}</div>
        </section>
    );
}

/*
 * ============================================================
 * FIELD
 * ============================================================
 */

function Field({
    label,
    ...props
}: {
    label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>

            <input className={inputClass} {...props} />
        </label>
    );
}

/*
 * ============================================================
 * TEXTAREA
 * ============================================================
 */

function TextAreaField({
    label,
    ...props
}: {
    label: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>

            <textarea className={textareaClass} {...props} />
        </label>
    );
}

/*
 * ============================================================
 * NUMBER FIELD
 * ============================================================
 */

function NumberField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number | "";
    onChange: (value: number | "") => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>

            <input
                className={inputClass}
                type="number"
                min={0}
                value={value}
                onChange={(event) => {
                    const value = event.target.value;

                    onChange(value === "" ? "" : Number(value));
                }}
            />
        </label>
    );
}

/*
 * ============================================================
 * DATE TIME FIELD
 * ============================================================
 */

function DateTimeField({
    label,
    value,
    onChange,
    required,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}) {
    return (
        <Field
            label={label}
            type="datetime-local"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={required}
        />
    );
}

/*
 * ============================================================
 * TOGGLE
 * ============================================================
 */

function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4">
            <span>
                <span className="block text-sm font-medium">{label}</span>

                <span className="mt-1 block max-w-2xl text-xs leading-5 text-muted-foreground">
                    {description}
                </span>
            </span>

            <span className="relative mt-0.5 shrink-0">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                />

                <span className="block h-6 w-11 rounded-full bg-muted transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30" />

                <span className="absolute left-1 top-1 size-4 rounded-full bg-background shadow-sm transition peer-checked:translate-x-5" />
            </span>
        </label>
    );
}
