"use client";

import { motion } from "framer-motion";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MapPin,
    Search,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAssessmentResults } from "@/hooks/queries/employer/useAssessmentResults";

interface EmployerCandidateListProps {
    assessmentId: string;
}

export default function EmployerCandidateList({
    assessmentId,
}: EmployerCandidateListProps) {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("percentage-desc");
    const [page, setPage] = useState(1);

    /*
     * Keep shortlist status in local UI state so the button/badge
     * updates immediately after a successful shortlist action.
     *
     * The API remains the source of truth. This state is synchronized
     * whenever fresh candidate results arrive.
     */
    const [shortlistedEmployees, setShortlistedEmployees] = useState<
        Record<string, boolean>
    >({});

    const {
        results,
        assessment,
        total,
        totalPages,
        isLoading,
        isFetching,
        shortlistCandidate,
        isShortlisting,
    } = useAssessmentResults({
        assessmentId,
        search: query,
        status,
        sort,
        page,
        limit: 10,
    });

    const [shortlistingEmployeeId, setShortlistingEmployeeId] = useState<
        string | null
    >(null);

    /*
     * Sync shortlist state from the server response.
     *
     * This means:
     * - Refreshing the page preserves the persisted shortlist state.
     * - React Query refetches update the UI.
     * - Existing shortlisted candidates remain shortlisted.
     */
    useEffect(() => {
        if (!results?.length) {
            return;
        }

        setShortlistedEmployees((current) => {
            const next = { ...current };

            results.forEach((candidate: any) => {
                const employeeId =
                    candidate.employee?.id ??
                    candidate.employee?._id ??
                    candidate.employeeId;

                if (!employeeId) {
                    return;
                }

                next[employeeId] = candidate.assignment?.shortlisted === true;
            });

            return next;
        });
    }, [results]);

    const handleShortlist = async (employeeId: string) => {
        /*
         * Prevent duplicate requests from the same candidate.
         */
        if (
            shortlistingEmployeeId === employeeId ||
            shortlistedEmployees[employeeId]
        ) {
            return;
        }

        try {
            setShortlistingEmployeeId(employeeId);

            await shortlistCandidate({
                assessmentId,
                employeeId,
            });

            /*
             * Immediately update the local UI state.
             *
             * The mutation also invalidates the React Query result,
             * so the server response will subsequently confirm this
             * state.
             */
            setShortlistedEmployees((current) => ({
                ...current,
                [employeeId]: true,
            }));
        } finally {
            setShortlistingEmployeeId(null);
        }
    };

    const pageNumbers = useMemo(() => {
        const pages: number[] = [];

        for (let current = 1; current <= totalPages; current++) {
            pages.push(current);
        }

        return pages;
    }, [totalPages]);

    return (
        <div>
            {assessment && (
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">
                        {assessment.title}
                    </h1>

                    {assessment.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {assessment.description}
                        </p>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Search name, skill, or location"
                        className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </label>

                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value);
                        setPage(1);
                    }}
                    className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                </select>

                <select
                    value={sort}
                    onChange={(event) => {
                        setSort(event.target.value);
                        setPage(1);
                    }}
                    className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option value="percentage-desc">Highest score</option>
                    <option value="percentage-asc">Lowest score</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="assignedAt-desc">Recently assigned</option>
                </select>
            </div>

            {/* Result count */}
            <div className="mt-5 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {total} candidates
                </p>

                {isFetching && !isLoading && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="mt-6 space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-24 animate-pulse rounded-xl border border-border bg-muted/30"
                        />
                    ))}
                </div>
            ) : results.length === 0 ? (
                /* Empty state */
                <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
                    <UserRound className="mx-auto size-8 text-muted-foreground" />

                    <h2 className="mt-3 font-semibold">No candidates found</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Try changing your search or filters.
                    </p>
                </div>
            ) : (
                /* Candidate list */
                <div className="mt-3 space-y-3">
                    {results.map((candidate: any, index: number) => {
                        const employeeId =
                            candidate.employee?.id ??
                            candidate.employee?._id ??
                            candidate.employeeId;

                        const name =
                            candidate.employee?.fullName ??
                            candidate.fullName ??
                            "Unknown candidate";

                        const email =
                            candidate.employee?.email ?? candidate.email;

                        const percentage =
                            candidate.attempt?.percentage ??
                            candidate.percentage;

                        const score =
                            candidate.attempt?.score ?? candidate.score;

                        const skills =
                            candidate.skills ?? assessment?.skills ?? [];

                        /*
                         * Local shortlist state is preferred
                         * once available.
                         *
                         * Fall back to API data so the UI also
                         * works correctly on the first render.
                         */
                        const isShortlisted =
                            shortlistedEmployees[employeeId] ??
                            candidate.assignment?.shortlisted === true;

                        const isCurrentShortlisting =
                            isShortlisting &&
                            shortlistingEmployeeId === employeeId;

                        return (
                            <motion.article
                                key={employeeId}
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: index * 0.05,
                                }}
                                className="rounded-xl border border-border p-4"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                    {/* Avatar */}
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        {name
                                            .split(" ")
                                            .map((part: string) => part[0])
                                            .slice(0, 2)
                                            .join("")}
                                    </div>

                                    {/* Candidate information */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold">
                                                {name}
                                            </h2>

                                            {isShortlisted && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                    <CheckCircle2 className="size-3" />
                                                    Shortlisted
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {email}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                            {skills.length > 0 && (
                                                <span>
                                                    {skills.join(" · ")}
                                                </span>
                                            )}

                                            {candidate.employee?.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="size-3.5" />

                                                    {
                                                        candidate.employee
                                                            .location
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Candidate actions */}
                                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                                        {/* Score */}
                                        <div className="min-w-20 text-left lg:text-right">
                                            <p className="text-lg font-semibold text-primary">
                                                {percentage != null
                                                    ? `${percentage}%`
                                                    : "—"}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {score != null
                                                    ? `${score} points`
                                                    : "Not attempted"}
                                            </p>
                                        </div>

                                        {/* View result */}
                                        <Link
                                            href={`/services/employer/candidates-results/${employeeId}?assessmentId=${assessmentId}`}
                                        >
                                            <Button variant="outline" size="sm">
                                                View result
                                            </Button>
                                        </Link>

                                        {/* Shortlist */}
                                        {!isShortlisted ? (
                                            <Button
                                                size="sm"
                                                disabled={isCurrentShortlisting}
                                                onClick={() =>
                                                    handleShortlist(employeeId)
                                                }
                                            >
                                                {isCurrentShortlisting ? (
                                                    <>
                                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                                        Shortlisting...
                                                    </>
                                                ) : (
                                                    "Shortlist"
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled
                                                className="gap-2"
                                            >
                                                <CheckCircle2 className="size-4" />
                                                Shortlisted
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === 1}
                        onClick={() =>
                            setPage((value) => Math.max(1, value - 1))
                        }
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    {pageNumbers.map((pageNumber) => (
                        <Button
                            key={pageNumber}
                            variant={
                                pageNumber === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setPage(pageNumber)}
                        >
                            {pageNumber}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((value) => Math.min(totalPages, value + 1))
                        }
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
