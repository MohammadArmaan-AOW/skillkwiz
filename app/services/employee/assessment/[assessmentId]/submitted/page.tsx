"use client";

import {
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
    LayoutDashboard,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface McqResult {
    questionId: string;
    question?: string;
    isCorrect: boolean;
    awardedPoints: number;
    points: number;
    selectedOptions?: string[];
    correctOptions?: string[];
}

interface SubmissionResult {
    attemptId?: string;
    status?: string;
    submittedAt?: string;

    score?: number;
    percentage?: number;

    mcqResults?: McqResult[];

    showResultToEmployee?: boolean;
    showCorrectAnswersToEmployee?: boolean;
}

export default function AssessmentSubmittedPage() {
    const router = useRouter();

    const [result, setResult] =
        useState<SubmissionResult | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedResult = sessionStorage.getItem(
                "assessmentSubmissionResult",
            );

            if (storedResult) {
                const parsedResult =
                    JSON.parse(storedResult) as SubmissionResult;

                setResult(parsedResult);

                /*
                 * Remove the result after reading it so that
                 * stale submission data does not appear later.
                 */
                sessionStorage.removeItem(
                    "assessmentSubmissionResult",
                );
            }
        } catch (error) {
            console.error(
                "Failed to restore assessment submission result:",
                error,
            );
        } finally {
            setIsLoaded(true);
        }
    }, []);

    /*
     * ---------------------------------------------------------
     * RESULT SETTINGS
     * ---------------------------------------------------------
     */

    const showResults =
        result?.showResultToEmployee === true;

    const showCorrectAnswers =
        result?.showCorrectAnswersToEmployee === true;

    /*
     * ---------------------------------------------------------
     * LOADING
     * ---------------------------------------------------------
     */

    if (!isLoaded) {
        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />

                        <p className="mt-4 text-sm text-muted-foreground">
                            Loading submission details...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full">
                    <div className="mx-auto max-w-2xl text-center">
                        {/* ------------------------------------------------ */}
                        {/* SUCCESS ICON */}
                        {/* ------------------------------------------------ */}

                        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle2 className="h-10 w-10 text-primary" />
                        </div>

                        {/* ------------------------------------------------ */}
                        {/* HEADING */}
                        {/* ------------------------------------------------ */}

                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                                Assessment Complete
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Assessment Submitted Successfully
                            </h1>

                            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                                Your assessment responses have been
                                submitted successfully. Thank you for
                                completing the assessment.
                            </p>
                        </div>

                        {/* ------------------------------------------------ */}
                        {/* CONFIRMATION CARD */}
                        {/* ------------------------------------------------ */}

                        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card p-6 text-left sm:p-7">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        Your responses have been received
                                    </h2>

                                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                        Your submission has been recorded
                                        and is now available for review by
                                        the employer.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-border pt-5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        Submission status
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Submitted
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ------------------------------------------------ */}
                        {/* RESULTS */}
                        {/* ------------------------------------------------ */}

                        {showResults && result && (
                            <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-border bg-card p-6 text-left sm:p-7">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Your Results
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Your automatically evaluated
                                        assessment results are shown below.
                                    </p>
                                </div>

                                {/* Score / Percentage */}

                                <div className="mt-5 grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-border bg-background p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Score
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-foreground">
                                            {typeof result.score ===
                                            "number"
                                                ? result.score
                                                : 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border bg-background p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Percentage
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-foreground">
                                            {typeof result.percentage ===
                                            "number"
                                                ? result.percentage
                                                : 0}
                                            %
                                        </p>
                                    </div>
                                </div>

                                {/* ------------------------------------------------ */}
                                {/* MCQ RESULTS */}
                                {/* ------------------------------------------------ */}

                                {result.mcqResults &&
                                    result.mcqResults.length > 0 && (
                                        <div className="mt-7">
                                            <div>
                                                <h3 className="text-base font-semibold text-foreground">
                                                    MCQ Results
                                                </h3>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Multiple-choice questions
                                                    were automatically
                                                    evaluated.
                                                </p>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                {result.mcqResults.map(
                                                    (
                                                        mcq,
                                                        index,
                                                    ) => (
                                                        <div
                                                            key={
                                                                mcq.questionId
                                                            }
                                                            className="rounded-xl border border-border bg-background p-4"
                                                        >
                                                            {/* Question */}

                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex min-w-0 items-start gap-2">
                                                                    {mcq.isCorrect ? (
                                                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                                                    ) : (
                                                                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                                                                    )}

                                                                    <div>
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            Question{" "}
                                                                            {index +
                                                                                1}
                                                                        </p>

                                                                        {mcq.question && (
                                                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                                                {
                                                                                    mcq.question
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <span className="shrink-0 text-sm font-semibold text-foreground">
                                                                    {
                                                                        mcq.awardedPoints
                                                                    }
                                                                    /
                                                                    {
                                                                        mcq.points
                                                                    }{" "}
                                                                    points
                                                                </span>
                                                            </div>

                                                            {/* Correct / Incorrect */}

                                                            {mcq.isCorrect ? (
                                                                <p className="mt-3 text-sm font-medium text-green-600">
                                                                    Correct
                                                                    answer
                                                                </p>
                                                            ) : (
                                                                <p className="mt-3 text-sm font-medium text-destructive">
                                                                    Incorrect
                                                                    answer
                                                                </p>
                                                            )}

                                                            {/* Selected Answer */}

                                                            {mcq.selectedOptions &&
                                                                mcq
                                                                    .selectedOptions
                                                                    .length >
                                                                    0 && (
                                                                    <div className="mt-3 rounded-lg border border-border bg-card p-3">
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                            Your
                                                                            answer
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-foreground">
                                                                            {mcq.selectedOptions.join(
                                                                                ", ",
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                            {/* Correct Answer */}

                                                            {showCorrectAnswers &&
                                                                mcq.correctOptions &&
                                                                mcq
                                                                    .correctOptions
                                                                    .length >
                                                                    0 && (
                                                                    <div className="mt-3 rounded-lg bg-muted/50 p-3">
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                            Correct
                                                                            answer
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-foreground">
                                                                            {mcq.correctOptions.join(
                                                                                ", ",
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* ------------------------------------------------ */}
                        {/* RESULTS NOT AVAILABLE */}
                        {/* ------------------------------------------------ */}

                        {!showResults && (
                            <div className="mx-auto mt-5 max-w-xl rounded-xl border border-border bg-card p-5">
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Your assessment has been submitted
                                    successfully. Results are not available
                                    at this time. The employer will review
                                    your submission and share the results if
                                    they become available.
                                </p>
                            </div>
                        )}

                        {/* ------------------------------------------------ */}
                        {/* ACTIONS */}
                        {/* ------------------------------------------------ */}

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/services/employee/assessments",
                                    )
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <ArrowLeft className="h-4 w-4" />

                                My Assessments
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/services/employee/assignments",
                                    )
                                }
                                className="primary-gradient inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                            >
                                <LayoutDashboard className="h-4 w-4" />

                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}