"use client";

import {
    AlertCircle,
    CalendarClock,
    Check,
    CheckCircle2,
    Clock3,
    FileCode2,
    FileText,
    ListChecks,
    Pencil,
    ShieldCheck,
    Timer,
    UserRound,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAssessment } from "@/hooks/queries/useAssessment";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type AssessmentStatus = "draft" | "published" | "closed" | "archived";

type QuestionType =
    | "short-text"
    | "long-text"
    | "coding"
    | "project-report"
    | "mcq";

type MCQOption = {
    optionId: string;
    text: string;
    isCorrect: boolean;
};

type AssessmentQuestion = {
    questionId: string;
    order: number;
    question: string;
    type: QuestionType;
    points: number;
    required: boolean;
    selectionType?: "single" | "multiple";
    options?: MCQOption[];
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
};

type AssignedEmployee = {
    employeeId:
        | string
        | {
              _id?: string;
              fullName?: string;
              email?: string;
          };
    assignedAt: string;
    emailSentAt?: string;
    status: "assigned" | "in-progress" | "completed" | "expired";
    startedAt?: string;
    submittedAt?: string;
};

type Assessment = {
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
    questions: AssessmentQuestion[];
    assignedEmployees: AssignedEmployee[];
    totalPoints: number;
    resultSettings: {
        showResultToEmployee: boolean;
        showCorrectAnswersToEmployee: boolean;
    };
    status: AssessmentStatus;
    createdAt: string;
    updatedAt: string;
};

type EmployerAssessmentResponse = {
    success: boolean;
    assessment: Assessment;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatDateTime(value?: string) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

function getStatusLabel(status: AssessmentStatus) {
    switch (status) {
        case "published":
            return "Published";

        case "draft":
            return "Draft";

        case "closed":
            return "Closed";

        case "archived":
            return "Archived";

        default:
            return status;
    }
}

function getQuestionTypeLabel(type: QuestionType) {
    switch (type) {
        case "short-text":
            return "Short text";

        case "long-text":
            return "Long text";

        case "project-report":
            return "Project report";

        case "coding":
            return "Coding";

        case "mcq":
            return "Multiple choice";

        default:
            return type;
    }
}

function getEmployeeName(employee: AssignedEmployee) {
    if (typeof employee.employeeId === "object") {
        return (
            employee.employeeId.fullName ||
            employee.employeeId.email ||
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

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function EmployerAssessmentView({
    assessmentId,
}: {
    assessmentId: string;
}) {
    const {
        employerAssessment,
        isEmployerAssessmentLoading,
        employerAssessmentError,
    } = useAssessment({
        role: "employer",
        assessmentId,
    });

    const assessmentResponse = employerAssessment as
        | EmployerAssessmentResponse
        | Assessment
        | undefined;

    const assessment =
        assessmentResponse && "assessment" in assessmentResponse
            ? assessmentResponse.assessment
            : assessmentResponse;

    /* ---------------------------------------------------------------------- */
    /* LOADING                                                                */
    /* ---------------------------------------------------------------------- */

    if (isEmployerAssessmentLoading) {
        return (
            <div className="space-y-5">
                <div className="animate-pulse rounded-2xl border border-border bg-card p-6">
                    <div className="h-6 w-1/3 rounded bg-muted" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
                    <div className="mt-6 h-20 rounded-xl bg-muted" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="animate-pulse rounded-2xl border border-border bg-card p-6"
                        >
                            <div className="h-5 w-1/3 rounded bg-muted" />
                            <div className="mt-5 space-y-3">
                                <div className="h-4 rounded bg-muted" />
                                <div className="h-4 w-4/5 rounded bg-muted" />
                                <div className="h-4 w-3/5 rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* ERROR                                                                  */
    /* ---------------------------------------------------------------------- */

    if (employerAssessmentError || !assessment) {
        return (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="size-5" />
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                    Unable to load assessment
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    The assessment could not be found or could not be loaded.
                    Please return to your assessments and try again.
                </p>

                <Button asChild className="mt-5">
                    <Link href="/services/employer/assessments">
                        Back to assessments
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* HEADER                                                           */}
            {/* ---------------------------------------------------------------- */}

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={assessment.status} />

                            <span className="text-xs text-muted-foreground">
                                {assessment.questions.length} questions
                            </span>

                            <span className="text-muted-foreground">·</span>

                            <span className="text-xs text-muted-foreground">
                                {assessment.totalPoints} points
                            </span>
                        </div>

                        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                            {assessment.title}
                        </h1>

                        {assessment.description && (
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                                {assessment.description}
                            </p>
                        )}
                    </div>

                    <Button asChild>
                        <Link
                            href={`/services/employer/assessments/${assessment._id}/edit`}
                        >
                            <Pencil className="mr-2 size-4" />
                            Edit assessment
                        </Link>
                    </Button>
                </div>

                <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryItem
                        icon={Users}
                        label="Candidates"
                        value={`${assessment.assignedEmployees.length}`}
                    />

                    <SummaryItem
                        icon={ListChecks}
                        label="Questions"
                        value={`${assessment.questions.length}`}
                    />

                    <SummaryItem
                        icon={Clock3}
                        label="Duration"
                        value={`${assessment.timing.durationMinutes} min`}
                    />

                    <SummaryItem
                        icon={FileText}
                        label="Total points"
                        value={`${assessment.totalPoints}`}
                    />
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* SKILLS + INSTRUCTIONS                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid gap-6 lg:grid-cols-2">
                {assessment.skills.length > 0 && (
                    <SectionCard icon={ListChecks} title="Skills">
                        <div className="flex flex-wrap gap-2">
                            {assessment.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {assessment.instructions && (
                    <SectionCard icon={FileText} title="Instructions">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                            {assessment.instructions}
                        </p>
                    </SectionCard>
                )}
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* SCHEDULE + TIMER                                                 */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard icon={CalendarClock} title="Schedule">
                    <div className="space-y-4">
                        <InfoRow
                            label="Starts"
                            value={formatDateTime(assessment.timing.startAt)}
                        />

                        <InfoRow
                            label="Ends"
                            value={formatDateTime(assessment.timing.endAt)}
                        />

                        <InfoRow
                            label="Duration"
                            value={`${assessment.timing.durationMinutes} minutes`}
                        />
                    </div>
                </SectionCard>

                <SectionCard icon={Timer} title="Timer">
                    <div className="space-y-4">
                        <InfoRow
                            label="Timer"
                            value={
                                assessment.timer.enabled
                                    ? "Enabled"
                                    : "Disabled"
                            }
                        />

                        <InfoRow
                            label="Auto-submit on expiry"
                            value={
                                assessment.timer.autoSubmitOnExpiry
                                    ? "Enabled"
                                    : "Disabled"
                            }
                        />
                    </div>
                </SectionCard>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* SECURITY + RESULTS                                               */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard icon={ShieldCheck} title="Security">
                    <div className="space-y-4">
                        <InfoRow
                            label="Track tab changes"
                            value={
                                assessment.security.trackTabChanges
                                    ? "Enabled"
                                    : "Disabled"
                            }
                        />

                        {assessment.security.trackTabChanges &&
                            assessment.security.maxTabChanges !== undefined && (
                                <InfoRow
                                    label="Maximum tab changes"
                                    value={`${assessment.security.maxTabChanges}`}
                                />
                            )}
                    </div>
                </SectionCard>

                <SectionCard icon={CheckCircle2} title="Results">
                    <div className="space-y-4">
                        <InfoRow
                            label="Show result to candidate"
                            value={
                                assessment.resultSettings.showResultToEmployee
                                    ? "Yes"
                                    : "No"
                            }
                        />

                        <InfoRow
                            label="Show correct answers"
                            value={
                                assessment.resultSettings
                                    .showCorrectAnswersToEmployee
                                    ? "Yes"
                                    : "No"
                            }
                        />
                    </div>
                </SectionCard>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* CANDIDATES                                                        */}
            {/* ---------------------------------------------------------------- */}

            <SectionCard
                icon={Users}
                title={`Assigned candidates (${assessment.assignedEmployees.length})`}
            >
                {assessment.assignedEmployees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No candidates are currently assigned.
                    </p>
                ) : (
                    <div className="divide-y divide-border rounded-xl border border-border">
                        {assessment.assignedEmployees.map((employee, index) => (
                            <div
                                key={`${getEmployeeName(employee)}-${index}`}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                        <UserRound className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {getEmployeeName(employee)}
                                        </p>

                                        <p className="truncate text-xs text-muted-foreground">
                                            {getEmployeeEmail(employee)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <AssignmentStatusBadge
                                        status={employee.status}
                                    />

                                    <span className="text-xs text-muted-foreground">
                                        Assigned{" "}
                                        {formatDate(employee.assignedAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* ---------------------------------------------------------------- */}
            {/* QUESTIONS                                                        */}
            {/* ---------------------------------------------------------------- */}

            <section className="space-y-4">
                <div>
                    <div className="flex items-center gap-2">
                        <ListChecks className="size-5 text-primary" />

                        <h2 className="text-lg font-semibold">Questions</h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Review every question and its configured evaluation
                        settings.
                    </p>
                </div>

                <div className="space-y-4">
                    {assessment.questions
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((question, index) => (
                            <QuestionCard
                                key={question.questionId}
                                question={question}
                                index={index}
                            />
                        ))}
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* FOOTER METADATA                                                  */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
                <span>Created {formatDate(assessment.createdAt)}</span>

                <span>Last updated {formatDate(assessment.updatedAt)}</span>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* QUESTION CARD                                                              */
/* -------------------------------------------------------------------------- */

function QuestionCard({
    question,
    index,
}: {
    question: AssessmentQuestion;
    index: number;
}) {
    return (
        <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <QuestionTypeBadge type={question.type} />

                            {question.required && (
                                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    Required
                                </span>
                            )}

                            <span className="text-xs text-muted-foreground">
                                {question.points}{" "}
                                {question.points === 1 ? "point" : "points"}
                            </span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                            {question.question}
                        </p>
                    </div>
                </div>

                {/* MCQ */}
                {question.type === "mcq" &&
                    question.options &&
                    question.options.length > 0 && (
                        <div className="ml-0 space-y-2 border-t border-border pt-4 sm:ml-13">
                            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <ListChecks className="size-3.5" />
                                {question.selectionType === "multiple"
                                    ? "Multiple selection"
                                    : "Single selection"}
                            </div>

                            {question.options.map((option) => (
                                <div
                                    key={option.optionId}
                                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                                        option.isCorrect
                                            ? "border-primary/30 bg-primary/5"
                                            : "border-border"
                                    }`}
                                >
                                    <div
                                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                                            option.isCorrect
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border"
                                        }`}
                                    >
                                        {option.isCorrect && (
                                            <Check className="size-3" />
                                        )}
                                    </div>

                                    <span className="text-sm leading-6">
                                        {option.text}
                                    </span>

                                    {option.isCorrect && (
                                        <span className="ml-auto shrink-0 text-xs font-medium text-primary">
                                            Correct
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                {/* CODING */}
                {question.type === "coding" && (
                    <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                        <DetailBlock
                            label="Language"
                            value={question.language || "Not specified"}
                        />

                        <DetailBlock
                            label="Auto evaluate"
                            value={
                                question.autoEvaluate ? "Enabled" : "Disabled"
                            }
                        />

                        {question.inputDescription && (
                            <DetailBlock
                                label="Input"
                                value={question.inputDescription}
                            />
                        )}

                        {question.outputDescription && (
                            <DetailBlock
                                label="Output"
                                value={question.outputDescription}
                            />
                        )}

                        {question.constraints && (
                            <DetailBlock
                                label="Constraints"
                                value={question.constraints}
                            />
                        )}

                        {question.starterCode && (
                            <div className="sm:col-span-2">
                                <DetailBlock
                                    label="Starter code"
                                    value={question.starterCode}
                                    mono
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* TEXT / PROJECT REPORT */}
                {(question.type === "short-text" ||
                    question.type === "long-text" ||
                    question.type === "project-report") && (
                    <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                        {question.minLength !== undefined && (
                            <DetailBlock
                                label="Minimum length"
                                value={`${question.minLength} characters`}
                            />
                        )}

                        {question.maxLength !== undefined && (
                            <DetailBlock
                                label="Maximum length"
                                value={`${question.maxLength} characters`}
                            />
                        )}

                        {question.answerPlaceholder && (
                            <div className="sm:col-span-2">
                                <DetailBlock
                                    label="Answer placeholder"
                                    value={question.answerPlaceholder}
                                />
                            </div>
                        )}
                    </div>
                )}

                {question.explanation && (
                    <div className="border-t border-border pt-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Explanation
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {question.explanation}
                        </p>
                    </div>
                )}
            </div>
        </article>
    );
}

/* -------------------------------------------------------------------------- */
/* SECTION CARD                                                               */
/* -------------------------------------------------------------------------- */

function SectionCard({
    icon: Icon,
    title,
    children,
}: {
    icon: typeof FileText;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
                <Icon className="size-4 text-primary" />

                <h2 className="font-semibold">{title}</h2>
            </div>

            <div className="mt-5">{children}</div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* SUMMARY ITEM                                                               */
/* -------------------------------------------------------------------------- */

function SummaryItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FileText;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>

                <p className="mt-0.5 text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* INFO ROW                                                                   */
/* -------------------------------------------------------------------------- */

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>

            <span className="text-right text-sm font-medium">{value}</span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* DETAIL BLOCK                                                               */
/* -------------------------------------------------------------------------- */

function DetailBlock({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>

            <p
                className={`mt-1 whitespace-pre-wrap text-sm leading-6 ${
                    mono
                        ? "rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs"
                        : ""
                }`}
            >
                {value}
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: AssessmentStatus }) {
    const classes: Record<AssessmentStatus, string> = {
        published: "border-primary/20 bg-primary/10 text-primary",
        draft: "border-border bg-muted text-muted-foreground",
        closed: "border-amber-500/20 bg-amber-500/10 text-amber-700",
        archived: "border-border bg-muted text-muted-foreground",
    };

    return (
        <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${classes[status]}`}
        >
            {getStatusLabel(status)}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* QUESTION TYPE BADGE                                                        */
/* -------------------------------------------------------------------------- */

function QuestionTypeBadge({ type }: { type: QuestionType }) {
    const Icon =
        type === "coding" ? FileCode2 : type === "mcq" ? ListChecks : FileText;

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Icon className="size-3.5" />
            {getQuestionTypeLabel(type)}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* ASSIGNMENT STATUS                                                          */
/* -------------------------------------------------------------------------- */

function AssignmentStatusBadge({
    status,
}: {
    status: "assigned" | "in-progress" | "completed" | "expired";
}) {
    const config = {
        assigned: {
            label: "Assigned",
            className: "border-border bg-muted text-muted-foreground",
        },
        "in-progress": {
            label: "In progress",
            className: "border-primary/20 bg-primary/10 text-primary",
        },
        completed: {
            label: "Completed",
            className: "border-primary/20 bg-primary/10 text-primary",
        },
        expired: {
            label: "Expired",
            className: "border-amber-500/20 bg-amber-500/10 text-amber-700",
        },
    };

    const current = config[status];

    return (
        <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${current.className}`}
        >
            {current.label}
        </span>
    );
}
