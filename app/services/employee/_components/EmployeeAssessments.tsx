"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    FileQuestion,
    Filter,
    Loader2,
    Search,
    SlidersHorizontal,
    Timer,
    X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAssessment } from "@/hooks/queries/useAssessment";

type AssessmentAssignmentStatus =
    | "assigned"
    | "in-progress"
    | "completed"
    | "expired";

type AssessmentStatus = "draft" | "published" | "closed" | "archived";

type AssessmentSort = "newest" | "oldest" | "name-asc" | "name-desc";

interface EmployeeAssessmentListItem {
    _id: string;
    title: string;
    description?: string;
    skills: string[];

    questions: {
        questionId: string;
        order: number;
        question: string;
        type: string;
        points: number;
        required: boolean;
    }[];

    assignment: {
        employeeId: string;
        assignedAt: string;
        status: AssessmentAssignmentStatus;
        startedAt?: string;
        submittedAt?: string;
    };

    totalPoints: number;

    status: AssessmentStatus;

    timing: {
        startAt: string;
        endAt: string;
        durationMinutes: number;
    };

    timer?: {
        enabled: boolean;
        autoSubmitOnExpiry: boolean;
    };

    resultSettings?: {
        showResultToEmployee: boolean;
        showCorrectAnswersToEmployee: boolean;
    };

    createdAt: string;
    updatedAt: string;
}

interface EmployeeAssessmentListResponse {
    assessments: EmployeeAssessmentListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const STATUS_OPTIONS: {
    value: AssessmentAssignmentStatus | "all";
    label: string;
}[] = [
    {
        value: "all",
        label: "All assessments",
    },
    {
        value: "assigned",
        label: "Assigned",
    },
    {
        value: "in-progress",
        label: "In Progress",
    },
    {
        value: "completed",
        label: "Completed",
    },
    {
        value: "expired",
        label: "Expired",
    },
];

const SORT_OPTIONS: {
    value: AssessmentSort;
    label: string;
}[] = [
    {
        value: "newest",
        label: "Newest first",
    },
    {
        value: "oldest",
        label: "Oldest first",
    },
    {
        value: "name-asc",
        label: "Name A–Z",
    },
    {
        value: "name-desc",
        label: "Name Z–A",
    },
];

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

function formatDateTime(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}

function getAvailability(assessment: EmployeeAssessmentListItem): {
    state:
        | "not-started"
        | "available"
        | "in-progress"
        | "completed"
        | "expired"
        | "closed";

    label: string;
    description: string;
} {
    const assignmentStatus = assessment.assignment.status;

    if (assignmentStatus === "completed") {
        return {
            state: "completed",
            label: "Completed",
            description: assessment.assignment.submittedAt
                ? `Submitted ${formatDate(assessment.assignment.submittedAt)}`
                : "Assessment completed",
        };
    }

    if (assignmentStatus === "expired") {
        return {
            state: "expired",
            label: "Expired",
            description: `Ended ${formatDateTime(assessment.timing.endAt)}`,
        };
    }

    if (assessment.status === "closed" || assessment.status === "archived") {
        return {
            state: "closed",
            label: "Unavailable",
            description: "This assessment is no longer available.",
        };
    }

    const now = Date.now();
    const startAt = new Date(assessment.timing.startAt).getTime();
    const endAt = new Date(assessment.timing.endAt).getTime();

    if (assignmentStatus === "in-progress") {
        if (now >= endAt) {
            return {
                state: "expired",
                label: "Expired",
                description: `Ended ${formatDateTime(assessment.timing.endAt)}`,
            };
        }

        return {
            state: "in-progress",
            label: "In Progress",
            description: "Continue your assessment.",
        };
    }

    if (now < startAt) {
        return {
            state: "not-started",
            label: "Not Started",
            description: `Available from ${formatDateTime(
                assessment.timing.startAt,
            )}`,
        };
    }

    if (now >= endAt) {
        return {
            state: "expired",
            label: "Expired",
            description: `Ended ${formatDateTime(assessment.timing.endAt)}`,
        };
    }

    return {
        state: "available",
        label: "Available",
        description: "You can start this assessment now.",
    };
}

function getStatusClasses(state: ReturnType<typeof getAvailability>["state"]) {
    switch (state) {
        case "available":
            return "bg-primary/10 text-primary";

        case "in-progress":
            return "bg-amber-500/10 text-amber-600 dark:text-amber-400";

        case "completed":
            return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

        case "expired":
            return "bg-destructive/10 text-destructive";

        case "not-started":
            return "bg-muted text-muted-foreground";

        case "closed":
            return "bg-muted text-muted-foreground";

        default:
            return "bg-muted text-muted-foreground";
    }
}

function getStatusDot(state: ReturnType<typeof getAvailability>["state"]) {
    switch (state) {
        case "available":
            return "bg-primary";

        case "in-progress":
            return "bg-amber-500";

        case "completed":
            return "bg-emerald-500";

        case "expired":
            return "bg-destructive";

        default:
            return "bg-muted-foreground";
    }
}

function AssessmentCardSkeleton() {
    return (
        <div className="rounded-2xl border bg-card p-6">
            <div className="animate-pulse space-y-5">
                <div className="h-6 w-3/5 rounded bg-muted" />
                <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-4/5 rounded bg-muted" />
                </div>

                <div className="flex gap-2">
                    <div className="h-7 w-20 rounded-full bg-muted" />
                    <div className="h-7 w-24 rounded-full bg-muted" />
                    <div className="h-7 w-16 rounded-full bg-muted" />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t pt-4">
                    <div className="h-4 rounded bg-muted" />
                    <div className="h-4 rounded bg-muted" />
                </div>

                <div className="h-10 rounded-lg bg-muted" />
            </div>
        </div>
    );
}

function EmptyState({
    hasFilters,
    onClear,
}: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    return (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <FileQuestion className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
                {hasFilters
                    ? "No assessments found"
                    : "No assessments assigned yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {hasFilters
                    ? "Try changing your search or filters to find another assessment."
                    : "Assessments assigned to you by your employer will appear here."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                    <X className="h-4 w-4" />
                    Clear filters
                </button>
            )}
        </div>
    );
}

function AssessmentCard({
    assessment,
    index,
}: {
    assessment: EmployeeAssessmentListItem;
    index: number;
}) {
    const router = useRouter();

    const availability = useMemo(
        () => getAvailability(assessment),
        [assessment],
    );

    const isActionable =
        availability.state === "available" ||
        availability.state === "in-progress";

    const handleOpenAssessment = () => {
        router.push(`/services/employee/assessment/${assessment._id}`);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                delay: Math.min(index * 0.05, 0.25),
            }}
            className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-primary/30"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="line-clamp-2 text-lg font-semibold tracking-tight">
                        {assessment.title}
                    </h2>

                    {assessment.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {assessment.description}
                        </p>
                    )}
                </div>

                <span
                    className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        getStatusClasses(availability.state),
                    )}
                >
                    <span
                        className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            getStatusDot(availability.state),
                        )}
                    />
                    {availability.label}
                </span>
            </div>

            {/* Skills */}
            {assessment.skills.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                    {assessment.skills.slice(0, 4).map((skill) => (
                        <span
                            key={skill}
                            className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                            {skill}
                        </span>
                    ))}

                    {assessment.skills.length > 4 && (
                        <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                            +{assessment.skills.length - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Meta */}
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileQuestion className="h-4 w-4 shrink-0" />
                    <span>
                        {assessment.questions.length}{" "}
                        {assessment.questions.length === 1
                            ? "question"
                            : "questions"}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{assessment.totalPoints} points</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                        {formatDate(assessment.timing.startAt)}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4 shrink-0" />
                    <span>{assessment.timing.durationMinutes} min</span>
                </div>
            </div>

            {/* Timing */}
            <div className="mt-4 rounded-xl bg-muted/40 p-3">
                <div className="flex items-start gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">
                            {availability.label}
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                            {availability.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-5">
                <button
                    type="button"
                    disabled={!isActionable}
                    onClick={handleOpenAssessment}
                    className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                        isActionable
                            ? "bg-primary text-white hover:opacity-90"
                            : "cursor-not-allowed bg-muted text-muted-foreground",
                    )}
                >
                    {availability.state === "available" && (
                        <>
                            Start Assessment
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}

                    {availability.state === "in-progress" && (
                        <>
                            Continue Assessment
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}

                    {availability.state === "completed" && "Completed"}

                    {availability.state === "not-started" &&
                        "Not Available Yet"}

                    {availability.state === "expired" && "Expired"}

                    {availability.state === "closed" && "Unavailable"}
                </button>
            </div>
        </motion.article>
    );
}

export default function EmployeeAssessments() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [status, setStatus] = useState<AssessmentAssignmentStatus | "all">(
        "all",
    );

    const [sort, setSort] = useState<AssessmentSort>("newest");

    const [page, setPage] = useState(1);

    const limit = 9;

    /*
     * Debounce search so we don't request the API on every keystroke.
     */
    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [search]);

    /*
     * IMPORTANT:
     * employeeListParams should be supported by useAssessment.
     */
    const {
        employeeAssessments,
        isEmployeeAssessmentsLoading,
        isEmployeeAssessmentsFetching,
        employeeAssessmentsError,
        refetchEmployeeAssessments,
    } = useAssessment({
        role: "employee",
        employeeListParams: {
            search: debouncedSearch || undefined,
            status,
            sort,
            page,
            limit,
        },
    });

    const response =
  employeeAssessments as EmployeeAssessmentListResponse | undefined;

    const assessments = response?.assessments ?? [];
    const total = response?.total ?? 0;
    const currentPage = response?.page ?? page;
    const totalPages = response?.totalPages ?? 0;

    const hasFilters = debouncedSearch.length > 0 || status !== "all";

    const handleStatusChange = (value: AssessmentAssignmentStatus | "all") => {
        setStatus(value);
        setPage(1);
    };

    const handleSortChange = (value: AssessmentSort) => {
        setSort(value);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setStatus("all");
        setSort("newest");
        setPage(1);
    };

    const showingFrom = total === 0 ? 0 : (currentPage - 1) * limit + 1;

    const showingTo = Math.min(currentPage * limit, total);

    return (
        <section className="w-full">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-7"
                >
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            My Assessments
                        </h1>

                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                            View assessments assigned to you, check their
                            availability, and continue assessments that are
                            already in progress.
                        </p>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="mb-6 rounded-2xl border bg-card p-4"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search assessments..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setDebouncedSearch("");
                                        setPage(1);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <Filter className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />

                            <select
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value as
                                            | AssessmentAssignmentStatus
                                            | "all",
                                    )
                                }
                                className="h-10 min-w-[170px] rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />

                            <select
                                value={sort}
                                onChange={(event) =>
                                    handleSortChange(
                                        event.target.value as AssessmentSort,
                                    )
                                }
                                className="h-10 min-w-[155px] rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear */}
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Results summary */}
                {!isEmployeeAssessmentsLoading &&
                    !employeeAssessmentsError &&
                    total > 0 && (
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {showingFrom}–{showingTo}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-foreground">
                                    {total}
                                </span>{" "}
                                assessments
                            </p>

                            {isEmployeeAssessmentsFetching && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                        </div>
                    )}

                {/* Error */}
                {employeeAssessmentsError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center"
                    >
                        <h3 className="text-lg font-semibold">
                            Unable to load assessments
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                            Something went wrong while loading your assessments.
                            Please try again.
                        </p>

                        <button
                            type="button"
                            onClick={() => refetchEmployeeAssessments}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Loading */}
                {isEmployeeAssessmentsLoading && (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <AssessmentCardSkeleton key={index} />
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isEmployeeAssessmentsLoading &&
                    !employeeAssessmentsError &&
                    assessments.length === 0 && (
                        <EmptyState
                            hasFilters={hasFilters}
                            onClear={clearFilters}
                        />
                    )}

                {/* Assessment Grid */}
                {!isEmployeeAssessmentsLoading &&
                    !employeeAssessmentsError &&
                    assessments.length > 0 && (
                        <>
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {assessments.map((assessment, index) => (
                                    <AssessmentCard
                                        key={assessment._id}
                                        assessment={assessment}
                                        index={index}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                                    <p className="text-sm text-muted-foreground">
                                        Page{" "}
                                        <span className="font-medium text-foreground">
                                            {currentPage}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium text-foreground">
                                            {totalPages}
                                        </span>
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={currentPage <= 1}
                                            onClick={() =>
                                                setPage((previousPage) =>
                                                    Math.max(
                                                        previousPage - 1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </button>

                                        <div className="flex h-9 min-w-9 items-center justify-center rounded-lg border bg-muted/40 px-3 text-sm font-medium">
                                            {currentPage}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={currentPage >= totalPages}
                                            onClick={() =>
                                                setPage((previousPage) =>
                                                    Math.min(
                                                        previousPage + 1,
                                                        totalPages,
                                                    ),
                                                )
                                            }
                                            className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
            </div>
        </section>
    );
}
