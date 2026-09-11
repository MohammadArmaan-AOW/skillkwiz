"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Code2,
    FileText,
    Loader2,
    LockKeyhole,
    Maximize2,
    Send,
    ShieldAlert,
} from "lucide-react";

import { useAssessment } from "@/hooks/queries/useAssessment";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEmployeeMe } from "@/hooks/queries/useEmployeeAuth";

interface EmployeeAssessmentProps {
    assessmentId: string;
}

type QuestionType =
    | "short-text"
    | "long-text"
    | "coding"
    | "project-report"
    | "mcq";

type SelectionType = "single" | "multiple";

interface AssessmentOption {
    optionId: string;
    text: string;
}

interface AssessmentQuestion {
    questionId: string;
    order: number;
    question: string;
    type: QuestionType;
    points: number;
    required: boolean;

    selectionType?: SelectionType;
    options?: AssessmentOption[];

    language?: string;
    starterCode?: string;
    inputDescription?: string;
    outputDescription?: string;
    constraints?: string;

    minLength?: number;
    maxLength?: number;
    answerPlaceholder?: string;
}

interface AssessmentTiming {
    startAt: string | Date;
    endAt: string | Date;
    durationMinutes: number;
}

interface EmployeeAssessmentData {
    _id?: string;
    title: string;
    description?: string;
    instructions?: string;
    skills?: string[];
    timing: AssessmentTiming;
    timer: {
        enabled: boolean;
        autoSubmitOnExpiry: boolean;
    };
    security: {
        trackTabChanges: boolean;
        maxTabChanges?: number;
    };
    questions: AssessmentQuestion[];
    totalPoints: number;
    resultSettings: {
        showResultToEmployee: boolean;
        showCorrectAnswersToEmployee: boolean;
    };
}

type AvailabilityStatus =
    | "not-started"
    | "available"
    | "in-progress"
    | "completed"
    | "expired"
    | "closed"
    | "unavailable";

interface EmployeeAssessmentResponse {
    success: boolean;
    assessment?: EmployeeAssessmentData;
    availability?: {
        status: AvailabilityStatus;
        startAt?: string;
        endAt?: string;
    };
    attempt?: {
        _id?: string;
        status?: "in-progress" | "completed" | "expired";
        startedAt?: string;
        expiresAt?: string;
    };
}

interface AnswerState {
    answer?: string;
    selectedOptions?: string[];
}

function getAssessmentData(value: unknown): EmployeeAssessmentResponse {
    if (!value || typeof value !== "object") {
        return {
            success: false,
        };
    }

    const response = value as Record<string, unknown>;

    if (response.assessment && typeof response.assessment === "object") {
        return response as unknown as EmployeeAssessmentResponse;
    }

    return {
        success: true,
        assessment: value as EmployeeAssessmentData,
    };
}

function formatTime(totalSeconds: number) {
    const safeSeconds = Math.max(0, totalSeconds);

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
    ].join(":");
}

function formatDateTime(value: string | Date) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function getInitialAnswer(
    questionId: string,
    answers: Record<string, AnswerState>,
) {
    return answers[questionId];
}

export default function EmployeeAssessment({
    assessmentId,
}: EmployeeAssessmentProps) {
    const router = useRouter();

    const {
        data: employeeMeData,
        isLoading: isEmployeeAuthLoading,
        isError: isEmployeeAuthError,
    } = useEmployeeMe();

    const {
        employeeAssessment,
        isEmployeeAssessmentLoading,
        employeeAssessmentError,

        startAssessment,
        isStartingAssessment,

        saveAnswer,
        isSavingAnswer,

        submitAssessment,
        isSubmittingAssessment,

        recordTabChange,
    } = useAssessment({
        role: "employee",
        assessmentId,
    });

    const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [attemptStarted, setAttemptStarted] = useState(false);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
        null,
    );

    const [tabChangeCount, setTabChangeCount] = useState(0);

    const [submitError, setSubmitError] = useState<string | null>(null);

    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

    const [isSubmittingLocally, setIsSubmittingLocally] = useState(false);

    const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
        {},
    );

    const hasAutoSubmitted = useRef(false);

    /*
     * --------------------------------------------------------------------------
     * Normalize employee assessment response
     * --------------------------------------------------------------------------
     */

    const assessmentResponse = useMemo(
        () => getAssessmentData(employeeAssessment),
        [employeeAssessment],
    );

    const assessment = assessmentResponse.assessment;

    const availability = assessmentResponse.availability;

    /*
     * --------------------------------------------------------------------------
     * Existing attempt
     * --------------------------------------------------------------------------
     */

    useEffect(() => {
        if (isEmployeeAuthLoading) {
            return;
        }

        if (isEmployeeAuthError || !employeeMeData?.employee) {
            router.replace(
                `/login?role=employee&redirect=${encodeURIComponent(
                    `/services/employee/assessment/${assessmentId}`,
                )}`,
            );
        }
    }, [
        assessmentId,
        employeeMeData,
        isEmployeeAuthError,
        isEmployeeAuthLoading,
        router,
    ]);

    useEffect(() => {
        if (!assessmentResponse.attempt) {
            return;
        }

        const attempt = assessmentResponse.attempt;

        if (attempt.status === "in-progress") {
            setAttemptStarted(true);

            if (attempt.expiresAt) {
                const expiry = new Date(attempt.expiresAt);

                if (!Number.isNaN(expiry.getTime())) {
                    setExpiresAt(expiry);
                }
            }
        }

        if (attempt.status === "completed") {
            setAttemptStarted(false);
        }
    }, [assessmentResponse.attempt]);

    /*
     * --------------------------------------------------------------------------
     * Question ordering
     * --------------------------------------------------------------------------
     */

    const questions = useMemo(() => {
        if (!assessment?.questions) {
            return [];
        }

        return [...assessment.questions].sort((a, b) => a.order - b.order);
    }, [assessment?.questions]);

    const currentQuestion = questions[currentQuestionIndex];

    /*
     * --------------------------------------------------------------------------
     * Answer helpers
     * --------------------------------------------------------------------------
     */

    const currentAnswer = currentQuestion
        ? getInitialAnswer(currentQuestion.questionId, answers)
        : undefined;

    const answeredQuestionIds = useMemo(() => {
        const ids = new Set<string>();

        for (const question of questions) {
            const answer = answers[question.questionId];

            if (!answer) {
                continue;
            }

            if (question.type === "mcq") {
                if (
                    answer.selectedOptions &&
                    answer.selectedOptions.length > 0
                ) {
                    ids.add(question.questionId);
                }

                continue;
            }

            if (
                typeof answer.answer === "string" &&
                answer.answer.trim().length > 0
            ) {
                ids.add(question.questionId);
            }
        }

        return ids;
    }, [answers, questions]);

    const answeredCount = answeredQuestionIds.size;

    const progress =
        questions.length > 0
            ? Math.round((answeredCount / questions.length) * 100)
            : 0;

    /*
     * --------------------------------------------------------------------------
     * Save answer
     *
     * We debounce saves so typing in text/code fields does not produce
     * a request for every single keystroke.
     * --------------------------------------------------------------------------
     */

    const persistAnswer = useCallback(
        (question: AssessmentQuestion, answerState: AnswerState) => {
            const questionId = question.questionId;

            if (saveTimers.current[questionId]) {
                clearTimeout(saveTimers.current[questionId]);
            }

            saveTimers.current[questionId] = setTimeout(() => {
                saveAnswer({
                    assessmentId,
                    payload: {
                        questionId,
                        answer: answerState.answer,
                        selectedOptions: answerState.selectedOptions,
                    },
                });

                delete saveTimers.current[questionId];
            }, 600);
        },
        [assessmentId, saveAnswer],
    );

    useEffect(() => {
        return () => {
            Object.values(saveTimers.current).forEach((timer) =>
                clearTimeout(timer),
            );
        };
    }, []);

    const updateAnswer = useCallback(
        (answerState: AnswerState) => {
            if (!currentQuestion) {
                return;
            }

            setAnswers((previous) => ({
                ...previous,
                [currentQuestion.questionId]: answerState,
            }));

            persistAnswer(currentQuestion, answerState);
        },
        [currentQuestion, persistAnswer],
    );

    /*
     * --------------------------------------------------------------------------
     * Start assessment
     * --------------------------------------------------------------------------
     */

    const handleStart = async () => {
        setSubmitError(null);

        try {
            const response = await startAssessment(assessmentId);

            const result = response as {
                attempt?: {
                    startedAt?: string;
                    expiresAt?: string;
                };
            };

            setAttemptStarted(true);

            if (result.attempt?.expiresAt) {
                const expiry = new Date(result.attempt.expiresAt);

                if (!Number.isNaN(expiry.getTime())) {
                    setExpiresAt(expiry);
                }
            }
        } catch (error) {
            console.error("Start assessment error:", error);

            setSubmitError("Unable to start the assessment. Please try again.");
        }
    };

    /*
     * --------------------------------------------------------------------------
     * Timer
     *
     * The server supplies expiresAt. The browser only displays the countdown.
     * --------------------------------------------------------------------------
     */

    useEffect(() => {
        if (!attemptStarted || !expiresAt) {
            return;
        }

        const updateTimer = () => {
            const difference = expiresAt.getTime() - Date.now();

            const seconds = Math.max(0, Math.ceil(difference / 1000));

            setRemainingSeconds(seconds);

            if (seconds <= 0 && !hasAutoSubmitted.current) {
                hasAutoSubmitted.current = true;

                if (assessment?.timer.autoSubmitOnExpiry) {
                    void handleSubmit(true);
                }
            }
        };

        updateTimer();

        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [attemptStarted, expiresAt, assessment?.timer.autoSubmitOnExpiry]);

    /*
     * --------------------------------------------------------------------------
     * Tab-change tracking
     * --------------------------------------------------------------------------
     */

    useEffect(() => {
        if (!attemptStarted || !assessment?.security.trackTabChanges) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState !== "hidden") {
                return;
            }

            recordTabChange(assessmentId);

            setTabChangeCount((previous) => previous + 1);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [
        assessmentId,
        assessment?.security.trackTabChanges,
        attemptStarted,
        recordTabChange,
    ]);

    /*
     * --------------------------------------------------------------------------
     * Browser context menu
     *
     * This is only a UX restriction, NOT a security boundary.
     * --------------------------------------------------------------------------
     */

    useEffect(() => {
        if (!attemptStarted) {
            return;
        }

        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [attemptStarted]);

    /*
     * --------------------------------------------------------------------------
     * Submit
     * --------------------------------------------------------------------------
     */

    const handleSubmit = async (automatic = false) => {
        if (isSubmittingLocally) {
            return;
        }

        setSubmitError(null);
        setIsSubmittingLocally(true);

        try {
            /*
             * The backend remains authoritative for:
             * - required-answer validation
             * - assessment timing
             * - MCQ evaluation
             * - final scoring
             *
             * Answers have already been persisted through the
             * answer autosave endpoint.
             */
            await submitAssessment(assessmentId);

            router.replace(
                `/services/employee/assessment/${assessmentId}/submitted`,
            );
        } catch (error) {
            console.error("Submit assessment error:", error);

            setSubmitError(
                automatic
                    ? "The assessment timer expired, but submission could not be completed. Please contact the employer."
                    : "Unable to submit the assessment. Please try again.",
            );

            setIsSubmittingLocally(false);
        }
    };

    /*
     * --------------------------------------------------------------------------
     * Loading state
     * --------------------------------------------------------------------------
     */

    if (isEmployeeAssessmentLoading) {
        return (
            <main className="min-h-screen bg-background">
                <div className="flex min-h-screen items-center justify-center px-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading assessment...</span>
                    </div>
                </div>
            </main>
        );
    }

    /*
     * --------------------------------------------------------------------------
     * Error state
     * --------------------------------------------------------------------------
     */

    if (employeeAssessmentError || !assessment) {
        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto flex min-h-screen max-w-2xl items-center px-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />

                        <AlertTitle>Assessment unavailable</AlertTitle>

                        <AlertDescription>
                            We could not load this assessment. Please try again
                            or contact your employer if the problem continues.
                        </AlertDescription>
                    </Alert>
                </div>
            </main>
        );
    }

    /*
     * --------------------------------------------------------------------------
     * Availability state
     * --------------------------------------------------------------------------
     */

    const availabilityStatus = availability?.status;

    const isAvailable = availabilityStatus === "available";

    const isNotStarted = availabilityStatus === "not-started";

    const isExpired = availabilityStatus === "expired";

    const isClosed = availabilityStatus === "closed";

    const isCompleted = availabilityStatus === "completed";

    /*
     * --------------------------------------------------------------------------
     * Locked / unavailable screen
     * --------------------------------------------------------------------------
     */

    if (!attemptStarted && !isAvailable) {
        let title = "Assessment unavailable";

        let description = "This assessment is not currently available.";

        if (isNotStarted) {
            title = "Assessment has not started";

            description = assessment.timing.startAt
                ? `This assessment will become available on ${formatDateTime(
                      assessment.timing.startAt,
                  )}.`
                : "The assessment is not available yet.";
        }

        if (isExpired) {
            title = "Assessment expired";

            description =
                "The assessment window has ended and this assessment can no longer be started.";
        }

        if (isClosed) {
            title = "Assessment closed";

            description = "This assessment has been closed by the employer.";
        }

        if (isCompleted) {
            title = "Assessment completed";

            description = "You have already completed this assessment.";
        }

        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
                    <Card className="w-full">
                        <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <LockKeyhole className="h-7 w-7 text-muted-foreground" />
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight">
                                {title}
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                                {description}
                            </p>

                            {isNotStarted && (
                                <div className="mt-6 rounded-lg border bg-muted/30 px-5 py-4">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock3 className="h-4 w-4" />
                                        Start time
                                    </div>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {formatDateTime(
                                            assessment.timing.startAt,
                                        )}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    /*
     * --------------------------------------------------------------------------
     * Pre-start screen
     *
     * This is only reached when the assessment is available.
     * The timer does NOT start until Start Assessment is clicked.
     * --------------------------------------------------------------------------
     */

    if (!attemptStarted) {
        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        SkillKwiz Assessment
                                    </p>

                                    <CardTitle className="mt-1 text-2xl">
                                        {assessment.title}
                                    </CardTitle>

                                    {assessment.description && (
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                            {assessment.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                    <Clock3 className="h-4 w-4" />
                                    <span>
                                        {assessment.timing.durationMinutes}{" "}
                                        minutes
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-8 p-6 sm:p-8">
                            {assessment.instructions && (
                                <section>
                                    <h2 className="text-base font-semibold">
                                        Instructions
                                    </h2>

                                    <div className="mt-3 whitespace-pre-wrap rounded-lg border bg-muted/20 p-4 text-sm leading-6">
                                        {assessment.instructions}
                                    </div>
                                </section>
                            )}

                            <section>
                                <h2 className="text-base font-semibold">
                                    Assessment information
                                </h2>

                                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Questions
                                        </p>

                                        <p className="mt-1 text-lg font-semibold">
                                            {questions.length}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Total points
                                        </p>

                                        <p className="mt-1 text-lg font-semibold">
                                            {assessment.totalPoints}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Time limit
                                        </p>

                                        <p className="mt-1 text-lg font-semibold">
                                            {assessment.timing.durationMinutes}{" "}
                                            min
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {assessment.skills &&
                                assessment.skills.length > 0 && (
                                    <section>
                                        <h2 className="text-base font-semibold">
                                            Skills assessed
                                        </h2>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {assessment.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full border px-3 py-1 text-xs"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                            <Alert>
                                <ShieldAlert className="h-4 w-4" />

                                <AlertTitle>Before you start</AlertTitle>

                                <AlertDescription>
                                    Once you start, your assessment timer will
                                    begin. Your attempt will be subject to the
                                    configured assessment time and security
                                    settings.
                                </AlertDescription>
                            </Alert>

                            {submitError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />

                                    <AlertTitle>Unable to start</AlertTitle>

                                    <AlertDescription>
                                        {submitError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    size="lg"
                                    disabled={isStartingAssessment}
                                    onClick={handleStart}
                                >
                                    {isStartingAssessment ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            Start Assessment
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    /*
     * --------------------------------------------------------------------------
     * Active assessment
     * --------------------------------------------------------------------------
     */

    const selectedOptions = currentAnswer?.selectedOptions ?? [];

    const textAnswer = currentAnswer?.answer ?? "";

    const isCurrentQuestionAnswered = answeredQuestionIds.has(
        currentQuestion?.questionId ?? "",
    );

    const timerIsLow = remainingSeconds !== null && remainingSeconds <= 300;

    const handleSingleChoice = (optionId: string) => {
        updateAnswer({
            selectedOptions: [optionId],
        });
    };

    const handleMultipleChoice = (optionId: string) => {
        const exists = selectedOptions.includes(optionId);

        const next = exists
            ? selectedOptions.filter((id) => id !== optionId)
            : [...selectedOptions, optionId];

        updateAnswer({
            selectedOptions: next,
        });
    };

    const handleTextChange = (value: string) => {
        updateAnswer({
            answer: value,
        });
    };

    const goToPreviousQuestion = () => {
        setCurrentQuestionIndex((previous) => Math.max(0, previous - 1));
    };

    const goToNextQuestion = () => {
        setCurrentQuestionIndex((previous) =>
            Math.min(questions.length - 1, previous + 1),
        );
    };

    const jumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    return (
        <main className="min-h-screen bg-background">
            {/* -----------------------------------------------------------------
                Assessment header
            ------------------------------------------------------------------ */}

            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {assessment.title}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Question {currentQuestionIndex + 1} of{" "}
                            {questions.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {assessment.security.trackTabChanges && (
                            <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:flex">
                                <ShieldAlert className="h-4 w-4" />

                                <span>
                                    Tab changes:{" "}
                                    <strong>{tabChangeCount}</strong>
                                    {typeof assessment.security
                                        .maxTabChanges === "number" &&
                                        ` / ${assessment.security.maxTabChanges}`}
                                </span>
                            </div>
                        )}

                        {assessment.timer.enabled && (
                            <div
                                className={[
                                    "flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-semibold",
                                    timerIsLow
                                        ? "border-destructive/40 text-destructive"
                                        : "",
                                ].join(" ")}
                            >
                                <Clock3 className="h-4 w-4" />

                                <span>
                                    {remainingSeconds !== null
                                        ? formatTime(remainingSeconds)
                                        : "--:--:--"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <Progress value={progress} className="h-1 rounded-none" />
            </header>

            {/* -----------------------------------------------------------------
                Assessment body
            ------------------------------------------------------------------ */}

            <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                {/* -------------------------------------------------------------
                    Question navigator
                -------------------------------------------------------------- */}

                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Questions</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="text-xs text-muted-foreground">
                                {answeredCount} of {questions.length} answered
                            </div>

                            <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
                                {questions.map((question, index) => {
                                    const answered = answeredQuestionIds.has(
                                        question.questionId,
                                    );

                                    const active =
                                        index === currentQuestionIndex;

                                    return (
                                        <button
                                            key={question.questionId}
                                            type="button"
                                            onClick={() =>
                                                jumpToQuestion(index)
                                            }
                                            className={[
                                                "relative flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium transition",
                                                active
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : answered
                                                      ? "border-primary/40 bg-primary/5"
                                                      : "hover:bg-muted",
                                            ].join(" ")}
                                        >
                                            {index + 1}

                                            {answered && !active && (
                                                <CheckCircle2 className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-background" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <Separator />

                            <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-sm border border-primary bg-primary/5" />
                                    Answered
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-sm border" />
                                    Not answered
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* -------------------------------------------------------------
                    Question
                -------------------------------------------------------------- */}

                <section className="min-w-0">
                    {currentQuestion && (
                        <Card>
                            <CardHeader className="border-b">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                Question{" "}
                                                {currentQuestionIndex + 1}
                                            </span>

                                            <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                                                {currentQuestion.points} points
                                            </span>

                                            {currentQuestion.required && (
                                                <span className="text-xs font-medium text-destructive">
                                                    Required
                                                </span>
                                            )}
                                        </div>

                                        <CardTitle className="mt-4 text-xl leading-8">
                                            {currentQuestion.question}
                                        </CardTitle>
                                    </div>

                                    <div className="shrink-0">
                                        {currentQuestion.type === "mcq" && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Multiple choice
                                            </div>
                                        )}

                                        {currentQuestion.type === "coding" && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Code2 className="h-4 w-4" />
                                                Coding
                                            </div>
                                        )}

                                        {currentQuestion.type ===
                                            "project-report" && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                Project report
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 p-6 sm:p-8">
                                {/* -------------------------------------------------
                                    MCQ
                                -------------------------------------------------- */}

                                {currentQuestion.type === "mcq" && (
                                    <div className="space-y-3">
                                        {currentQuestion.selectionType ===
                                        "multiple" ? (
                                            currentQuestion.options?.map(
                                                (option) => {
                                                    const checked =
                                                        selectedOptions.includes(
                                                            option.optionId,
                                                        );

                                                    return (
                                                        <label
                                                            key={
                                                                option.optionId
                                                            }
                                                            className={[
                                                                "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition",
                                                                checked
                                                                    ? "border-primary bg-primary/5"
                                                                    : "hover:bg-muted/40",
                                                            ].join(" ")}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    checked
                                                                }
                                                                onChange={() =>
                                                                    handleMultipleChoice(
                                                                        option.optionId,
                                                                    )
                                                                }
                                                                className="mt-1 h-4 w-4"
                                                            />

                                                            <span className="text-sm leading-6">
                                                                {option.text}
                                                            </span>
                                                        </label>
                                                    );
                                                },
                                            )
                                        ) : (
                                            <RadioGroup
                                                value={selectedOptions[0] ?? ""}
                                                onValueChange={
                                                    handleSingleChoice
                                                }
                                            >
                                                {currentQuestion.options?.map(
                                                    (option) => (
                                                        <Label
                                                            key={
                                                                option.optionId
                                                            }
                                                            htmlFor={
                                                                option.optionId
                                                            }
                                                            className={[
                                                                "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition",
                                                                selectedOptions.includes(
                                                                    option.optionId,
                                                                )
                                                                    ? "border-primary bg-primary/5"
                                                                    : "hover:bg-muted/40",
                                                            ].join(" ")}
                                                        >
                                                            <RadioGroupItem
                                                                id={
                                                                    option.optionId
                                                                }
                                                                value={
                                                                    option.optionId
                                                                }
                                                                className="mt-1"
                                                            />

                                                            <span className="text-sm leading-6">
                                                                {option.text}
                                                            </span>
                                                        </Label>
                                                    ),
                                                )}
                                            </RadioGroup>
                                        )}
                                    </div>
                                )}

                                {/* -------------------------------------------------
                                    Short text
                                -------------------------------------------------- */}

                                {currentQuestion.type === "short-text" && (
                                    <div className="space-y-3">
                                        <Input
                                            value={textAnswer}
                                            onChange={(event) =>
                                                handleTextChange(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={
                                                currentQuestion.answerPlaceholder ??
                                                "Enter your answer..."
                                            }
                                            maxLength={
                                                currentQuestion.maxLength
                                            }
                                        />

                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>
                                                {currentQuestion.minLength
                                                    ? `Minimum ${currentQuestion.minLength} characters`
                                                    : ""}
                                            </span>

                                            {currentQuestion.maxLength && (
                                                <span>
                                                    {textAnswer.length} /{" "}
                                                    {currentQuestion.maxLength}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* -------------------------------------------------
                                    Long text
                                -------------------------------------------------- */}

                                {currentQuestion.type === "long-text" && (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={textAnswer}
                                            onChange={(event) =>
                                                handleTextChange(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={
                                                currentQuestion.answerPlaceholder ??
                                                "Write your answer..."
                                            }
                                            maxLength={
                                                currentQuestion.maxLength
                                            }
                                            className="min-h-[280px] resize-y leading-6"
                                        />

                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>
                                                {currentQuestion.minLength
                                                    ? `Minimum ${currentQuestion.minLength} characters`
                                                    : ""}
                                            </span>

                                            {currentQuestion.maxLength && (
                                                <span>
                                                    {textAnswer.length} /{" "}
                                                    {currentQuestion.maxLength}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* -------------------------------------------------
                                    Coding
                                -------------------------------------------------- */}

                                {currentQuestion.type === "coding" && (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg border bg-muted/30 px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Code2 className="h-4 w-4" />

                                                {currentQuestion.language ??
                                                    "Code"}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                Your code will be reviewed by
                                                the employer.
                                            </div>
                                        </div>

                                        {currentQuestion.starterCode && (
                                            <div className="overflow-hidden rounded-lg border">
                                                <div className="border-b bg-muted/30 px-4 py-2 text-xs font-medium">
                                                    Starter code
                                                </div>

                                                <pre className="overflow-x-auto bg-muted/10 p-4 text-sm leading-6">
                                                    <code>
                                                        {
                                                            currentQuestion.starterCode
                                                        }
                                                    </code>
                                                </pre>
                                            </div>
                                        )}

                                        {currentQuestion.inputDescription && (
                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Input
                                                </h3>

                                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                                    {
                                                        currentQuestion.inputDescription
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {currentQuestion.outputDescription && (
                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Output
                                                </h3>

                                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                                    {
                                                        currentQuestion.outputDescription
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {currentQuestion.constraints && (
                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Constraints
                                                </h3>

                                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                                    {
                                                        currentQuestion.constraints
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="overflow-hidden rounded-lg border bg-[#111]">
                                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                                                <span className="text-xs text-white/60">
                                                    {currentQuestion.language ??
                                                        "Code"}
                                                </span>

                                                <Code2 className="h-4 w-4 text-white/50" />
                                            </div>

                                            <textarea
                                                value={textAnswer}
                                                onChange={(event) =>
                                                    handleTextChange(
                                                        event.target.value,
                                                    )
                                                }
                                                spellCheck={false}
                                                autoCapitalize="off"
                                                autoCorrect="off"
                                                className="min-h-[420px] w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 text-white outline-none"
                                                placeholder="// Write your code here..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* -------------------------------------------------
                                    Project report
                                -------------------------------------------------- */}

                                {currentQuestion.type === "project-report" && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4 shrink-0" />
                                            Your project report will be reviewed
                                            by the employer.
                                        </div>

                                        <Textarea
                                            value={textAnswer}
                                            onChange={(event) =>
                                                handleTextChange(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={
                                                currentQuestion.answerPlaceholder ??
                                                "Describe your project, approach, implementation, decisions, challenges, and results..."
                                            }
                                            maxLength={
                                                currentQuestion.maxLength
                                            }
                                            className="min-h-[360px] resize-y leading-7"
                                        />

                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>
                                                {currentQuestion.minLength
                                                    ? `Minimum ${currentQuestion.minLength} characters`
                                                    : ""}
                                            </span>

                                            {currentQuestion.maxLength && (
                                                <span>
                                                    {textAnswer.length} /{" "}
                                                    {currentQuestion.maxLength}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* -------------------------------------------------
                                    Save indicator
                                -------------------------------------------------- */}

                                <div className="flex items-center justify-end text-xs text-muted-foreground">
                                    {isSavingAnswer ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Saving answer...
                                        </span>
                                    ) : isCurrentQuestionAnswered ? (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Answer saved
                                        </span>
                                    ) : (
                                        <span>Not answered</span>
                                    )}
                                </div>

                                {submitError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />

                                        <AlertTitle>
                                            Submission error
                                        </AlertTitle>

                                        <AlertDescription>
                                            {submitError}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>

                            {/* -----------------------------------------------------
                                Navigation
                            ------------------------------------------------------ */}

                            <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    variant="outline"
                                    disabled={currentQuestionIndex === 0}
                                    onClick={goToPreviousQuestion}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {currentQuestionIndex <
                                    questions.length - 1 ? (
                                        <Button onClick={goToNextQuestion}>
                                            Next
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() =>
                                                setShowSubmitConfirmation(true)
                                            }
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Assessment
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* -------------------------------------------------------------
                        Mobile question navigation
                    -------------------------------------------------------------- */}

                    <div className="mt-4 flex items-center justify-between lg:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentQuestionIndex === 0}
                            onClick={goToPreviousQuestion}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                        </Button>

                        <span className="text-xs text-muted-foreground">
                            {currentQuestionIndex + 1} / {questions.length}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                currentQuestionIndex === questions.length - 1
                            }
                            onClick={goToNextQuestion}
                        >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </section>
            </div>

            {/* -----------------------------------------------------------------
                Submit confirmation
            ------------------------------------------------------------------ */}

            {showSubmitConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Submit assessment?</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <p className="text-sm leading-6 text-muted-foreground">
                                You have answered{" "}
                                <strong>{answeredCount}</strong> of{" "}
                                <strong>{questions.length}</strong> questions.
                            </p>

                            {answeredCount < questions.length && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />

                                    <AlertTitle>
                                        Some questions are unanswered
                                    </AlertTitle>

                                    <AlertDescription>
                                        You can still submit the assessment.
                                        Required question validation will be
                                        performed by the server.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    variant="outline"
                                    disabled={
                                        isSubmittingLocally ||
                                        isSubmittingAssessment
                                    }
                                    onClick={() =>
                                        setShowSubmitConfirmation(false)
                                    }
                                >
                                    Continue Assessment
                                </Button>

                                <Button
                                    disabled={
                                        isSubmittingLocally ||
                                        isSubmittingAssessment
                                    }
                                    onClick={() => {
                                        setShowSubmitConfirmation(false);

                                        void handleSubmit(false);
                                    }}
                                >
                                    {isSubmittingLocally ||
                                    isSubmittingAssessment ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}
