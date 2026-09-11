"use client";

import {
    AlertCircle,
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    Clock3,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAssessment } from "@/hooks/queries/useAssessment";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type AssessmentStatus = "draft" | "published" | "closed" | "archived";

type AssessmentListItem = {
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
    assignedEmployees: {
        employeeId: string;
        assignedAt: string;
        status: "assigned" | "in-progress" | "completed" | "expired";
    }[];
    totalPoints: number;
    status: AssessmentStatus;
    timing: {
        startAt: string;
        endAt: string;
        durationMinutes: number;
    };
    createdAt: string;
    updatedAt: string;
};

type AssessmentListResponse = {
    assessments: AssessmentListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
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

function formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
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

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function EmployerAssessmentsList() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<AssessmentStatus | "all">("all");
    const [sort, setSort] = useState<
        "newest" | "oldest" | "name-asc" | "name-desc"
    >("newest");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [deleteTarget, setDeleteTarget] = useState<AssessmentListItem | null>(
        null,
    );

    const {
        employerAssessments,
        isEmployerAssessmentsLoading,
        isEmployerAssessmentsFetching,
        employerAssessmentsError,
        deleteAssessment,
        isDeletingAssessment,
    } = useAssessment({
        role: "employer",
        employerListParams: {
            search,
            status,
            sort,
            page,
            limit,
        },
    });

    const assessmentData = employerAssessments as
        | AssessmentListResponse
        | undefined;

    const assessments = assessmentData?.assessments ?? [];
    const total = assessmentData?.total ?? 0;
    const totalPages = assessmentData?.totalPages ?? 1;
    const currentPage = assessmentData?.page ?? page;

    /*
     * Keep this flexible while the hook/API response is being typed.
     */
    const response = assessments as
        | AssessmentListResponse
        | AssessmentListItem[]
        | undefined;

    const assessmentItems = Array.isArray(response)
        ? response
        : (response?.assessments ?? []);

    /* ---------------------------------------------------------------------- */
    /* DELETE                                                                  */
    /* ---------------------------------------------------------------------- */

    const handleDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await deleteAssessment(deleteTarget._id);

            setDeleteTarget(null);

            /*
             * If the current page becomes empty after deletion,
             * move back one page.
             */
            if (assessmentItems.length === 1 && page > 1) {
                setPage((current) => current - 1);
            }
        } catch {
            /*
             * The mutation hook owns the actual error state.
             */
        }
    };

    /* ---------------------------------------------------------------------- */
    /* SEARCH                                                                  */
    /* ---------------------------------------------------------------------- */

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: AssessmentStatus | "all") => {
        setStatus(value);
        setPage(1);
    };

    const handleSortChange = (
        value: "newest" | "oldest" | "name-asc" | "name-desc",
    ) => {
        setSort(value);
        setPage(1);
    };

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                  */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* HEADER                                                            */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Your assessments</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage assessments you have created and assigned.
                    </p>
                </div>

                <Button asChild>
                    <Link href="/services/employer/assessments/new">
                        <Plus className="mr-2 size-4" />
                        New assessment
                    </Link>
                </Button>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* FILTERS                                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                    {/* Search */}
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            value={search}
                            onChange={(event) =>
                                handleSearchChange(event.target.value)
                            }
                            placeholder="Search assessments..."
                            className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={status}
                        onChange={(event) =>
                            handleStatusChange(
                                event.target.value as AssessmentStatus | "all",
                            )
                        }
                        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(event) =>
                            handleSortChange(
                                event.target.value as
                                    | "newest"
                                    | "oldest"
                                    | "name-asc"
                                    | "name-desc",
                            )
                        }
                        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                    </select>
                </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* ERROR                                                             */}
            {/* ---------------------------------------------------------------- */}

            {employerAssessmentsError && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />

                    <div>
                        <p className="font-medium">
                            Unable to load assessments
                        </p>

                        <p className="mt-1 text-destructive/80">
                            Please refresh the page and try again.
                        </p>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* LOADING                                                           */}
            {/* ---------------------------------------------------------------- */}

            {isEmployerAssessmentsLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="animate-pulse rounded-2xl border border-border bg-card p-5"
                        >
                            <div className="h-5 w-1/3 rounded bg-muted" />

                            <div className="mt-3 h-4 w-2/3 rounded bg-muted" />

                            <div className="mt-5 flex gap-3">
                                <div className="h-8 w-20 rounded bg-muted" />
                                <div className="h-8 w-24 rounded bg-muted" />
                                <div className="h-8 w-28 rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : assessmentItems.length === 0 ? (
                /* ------------------------------------------------------------ */
                /* EMPTY STATE                                                    */
                /* ------------------------------------------------------------ */

                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="size-5" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold">
                        {search || status !== "all"
                            ? "No assessments found"
                            : "No assessments yet"}
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {search || status !== "all"
                            ? "Try changing your search or filter to find another assessment."
                            : "Create your first assessment to evaluate a candidate's skills."}
                    </p>

                    {!search && status === "all" && (
                        <Button asChild className="mt-5">
                            <Link href="/services/employer/assessments/new">
                                <Plus className="mr-2 size-4" />
                                Create assessment
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                /* ------------------------------------------------------------ */
                /* LIST                                                           */
                /* ------------------------------------------------------------ */

                <div className="space-y-3">
                    {assessmentItems.map((assessment) => (
                        <AssessmentCard
                            key={assessment._id}
                            assessment={assessment}
                            onDelete={() => setDeleteTarget(assessment)}
                        />
                    ))}
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* PAGINATION                                                        */}
            {/* ---------------------------------------------------------------- */}

            {!isEmployerAssessmentsLoading &&
                assessmentItems.length > 0 &&
                totalPages > 1 && (
                    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing{" "}
                            <span className="font-medium text-foreground">
                                {(page - 1) * limit + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-foreground">
                                {Math.min(page * limit, total)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground">
                                {total}
                            </span>{" "}
                            assessments
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={
                                    page <= 1 || isEmployerAssessmentsFetching
                                }
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                            >
                                <ChevronLeft className="mr-1 size-4" />
                                Previous
                            </Button>

                            <div className="min-w-20 text-center text-sm">
                                Page <span className="font-medium">{page}</span>{" "}
                                of{" "}
                                <span className="font-medium">
                                    {totalPages}
                                </span>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={
                                    page >= totalPages ||
                                    isEmployerAssessmentsFetching
                                }
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(totalPages, current + 1),
                                    )
                                }
                            >
                                Next
                                <ChevronRight className="ml-1 size-4" />
                            </Button>
                        </div>
                    </div>
                )}

            {/* ---------------------------------------------------------------- */}
            {/* DELETE DIALOG                                                     */}
            {/* ---------------------------------------------------------------- */}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-assessment-title"
                        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
                    >
                        <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
                            <Trash2 className="size-5" />
                        </div>

                        <h3
                            id="delete-assessment-title"
                            className="mt-4 text-lg font-semibold"
                        >
                            Delete assessment?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            This will permanently delete{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget.title}
                            </span>
                            . This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isDeletingAssessment}
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                disabled={isDeletingAssessment}
                                onClick={handleDelete}
                            >
                                {isDeletingAssessment ? (
                                    <>
                                        <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 size-4" />
                                        Delete assessment
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* ASSESSMENT CARD                                                            */
/* -------------------------------------------------------------------------- */

function AssessmentCard({
    assessment,
    onDelete,
}: {
    assessment: AssessmentListItem;
    onDelete: () => void;
}) {
    return (
        <article className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/20 sm:p-6">
            <div className="flex flex-col gap-5">
                {/* ------------------------------------------------------------ */}
                {/* TOP                                                           */}
                {/* ------------------------------------------------------------ */}

                <div className="flex items-start gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-semibold">
                                {assessment.title}
                            </h3>

                            <StatusBadge status={assessment.status} />
                        </div>

                        {assessment.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                {assessment.description}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Assessment actions"
                        >
                            <MoreHorizontal className="size-4" />
                        </button>
                    </div>
                </div>

                {/* ------------------------------------------------------------ */}
                {/* SKILLS                                                        */}
                {/* ------------------------------------------------------------ */}

                {assessment.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {assessment.skills.slice(0, 5).map((skill) => (
                            <span
                                key={skill}
                                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                            >
                                {skill}
                            </span>
                        ))}

                        {assessment.skills.length > 5 && (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                +{assessment.skills.length - 5}
                            </span>
                        )}
                    </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* METADATA                                                       */}
                {/* ------------------------------------------------------------ */}

                <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetaItem
                        icon={UserRound}
                        label="Candidates"
                        value={`${assessment.assignedEmployees.length}`}
                    />

                    <MetaItem
                        icon={FileText}
                        label="Questions"
                        value={`${assessment.questions.length} · ${assessment.totalPoints} pts`}
                    />

                    <MetaItem
                        icon={Clock3}
                        label="Duration"
                        value={`${assessment.timing.durationMinutes} min`}
                    />

                    <MetaItem
                        icon={CalendarClock}
                        label="Schedule"
                        value={formatDateTime(assessment.timing.startAt)}
                    />
                </div>

                {/* ------------------------------------------------------------ */}
                {/* FOOTER                                                         */}
                {/* ------------------------------------------------------------ */}

                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        Created {formatDate(assessment.createdAt)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={`/services/employer/assessments/${assessment._id}`}
                            >
                                View
                            </Link>
                        </Button>

                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={`/services/employer/assessments/${assessment._id}/edit`}
                            >
                                <Pencil className="mr-1.5 size-3.5" />
                                Edit
                            </Link>
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="mr-1.5 size-3.5" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </article>
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
/* META ITEM                                                                  */
/* -------------------------------------------------------------------------- */

function MetaItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FileText;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <Icon className="size-4 shrink-0 text-muted-foreground" />

            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>

                <p className="truncate text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}
