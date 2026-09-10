"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

import {
    useEmployeeList,
    type Employee,
} from "@/hooks/queries/useEmployeeAuth";

import CandidateForm from "./CandidateForm";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "active" | "inactive";
type SignedInFilter = "all" | "signed-in" | "not-signed-in";
type SortOption =
    | "newest"
    | "oldest"
    | "name-asc"
    | "name-desc";

export default function CandidateList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const urlSearch = searchParams.get("search") ?? "";
    const urlStatus =
        (searchParams.get("status") as StatusFilter) || "all";
    const urlSignedIn =
        (searchParams.get("signedIn") as SignedInFilter) ||
        "all";
    const urlSort =
        (searchParams.get("sort") as SortOption) || "newest";
    const urlPage = Math.max(
        1,
        Number(searchParams.get("page") || 1),
    );

    const [searchInput, setSearchInput] =
        useState(urlSearch);

    useEffect(() => {
        setSearchInput(urlSearch);
    }, [urlSearch]);

    const updateParams = (
        updates: Record<string, string | null>,
    ) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(
            ([key, value]) => {
                if (!value) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            },
        );

        router.push(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchInput.trim() === urlSearch) {
                return;
            }

            updateParams({
                search: searchInput.trim() || null,
                page: "1",
            });
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchInput]);

    const { data, isLoading, isError, error, refetch } =
        useEmployeeList({
            search: urlSearch,
            status: urlStatus,
            signedIn: urlSignedIn,
            sort: urlSort,
            page: urlPage,
            limit: PAGE_SIZE,
        });

    const candidates = data?.employees ?? [];
    const total = data?.count ?? candidates.length;
    const totalPages = Math.max(
        1,
        Math.ceil(total / PAGE_SIZE),
    );

    const activeFilterCount = useMemo(() => {
        let count = 0;

        if (urlStatus !== "all") count++;
        if (urlSignedIn !== "all") count++;
        if (urlSort !== "newest") count++;

        return count;
    }, [urlStatus, urlSignedIn, urlSort]);

    const hasFilters =
        Boolean(urlSearch) ||
        urlStatus !== "all" ||
        urlSignedIn !== "all" ||
        urlSort !== "newest";

    const clearFilters = () => {
        setSearchInput("");

        router.push(pathname, {
            scroll: false,
        });
    };

    return (
        <div className="space-y-5">
            {/* Header */}

            {/* Search + Filters */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                        <input
                            value={searchInput}
                            onChange={(e) =>
                                setSearchInput(e.target.value)
                            }
                            placeholder="Search by name, email or candidate ID..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                        />

                        {searchInput && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearchInput("")
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Status */}
                    <select
                        value={urlStatus}
                        onChange={(e) =>
                            updateParams({
                                status: e.target.value,
                                page: "1",
                            })
                        }
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
                    >
                        <option value="all">
                            All Status
                        </option>
                        <option value="active">
                            Active
                        </option>
                        <option value="inactive">
                            Inactive
                        </option>
                    </select>

                    {/* Sign-in */}
                    <select
                        value={urlSignedIn}
                        onChange={(e) =>
                            updateParams({
                                signedIn: e.target.value,
                                page: "1",
                            })
                        }
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
                    >
                        <option value="all">
                            All Sign-In Status
                        </option>
                        <option value="signed-in">
                            Signed In
                        </option>
                        <option value="not-signed-in">
                            Not Signed In
                        </option>
                    </select>

                    {/* Sort */}
                    <select
                        value={urlSort}
                        onChange={(e) =>
                            updateParams({
                                sort: e.target.value,
                                page: "1",
                            })
                        }
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
                    >
                        <option value="newest">
                            Newest First
                        </option>
                        <option value="oldest">
                            Oldest First
                        </option>
                        <option value="name-asc">
                            Name A–Z
                        </option>
                        <option value="name-desc">
                            Name Z–A
                        </option>
                    </select>
                </div>

                {/* Active filters */}
                {hasFilters && (
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <SlidersHorizontal className="h-3.5 w-3.5" />

                            <span>
                                {activeFilterCount > 0
                                    ? `${activeFilterCount} filter${
                                          activeFilterCount > 1
                                              ? "s"
                                              : ""
                                      } applied`
                                    : "Search applied"}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-semibold text-primary hover:underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </section>

            {/* Table */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            Candidate List
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {total}{" "}
                            {total === 1
                                ? "candidate"
                                : "candidates"}
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingState />
                ) : isError ? (
                    <ErrorState
                        message={error.message}
                        onRetry={() => refetch()}
                    />
                ) : candidates.length === 0 ? (
                    <EmptyState
                        hasFilters={hasFilters}
                        onClear={clearFilters}
                    />
                ) : (
                    <>
                        <CandidateTable
                            candidates={candidates}
                        />

                        <Pagination
                            page={urlPage}
                            totalPages={totalPages}
                            onPageChange={(page) =>
                                updateParams({
                                    page: String(page),
                                })
                            }
                        />
                    </>
                )}
            </section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Table                                     */
/* -------------------------------------------------------------------------- */

function CandidateTable({
    candidates,
}: {
    candidates: Employee[];
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70 text-left">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Candidate
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Candidate ID
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Department
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Sign-In
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {candidates.map((candidate) => (
                        <tr
                            key={candidate.employeeId}
                            className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/50"
                        >
                            <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-gray-900">
                                    {candidate.fullName}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    {candidate.email}
                                </p>
                            </td>

                            <td className="px-5 py-4">
                                <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs font-medium text-gray-700">
                                    {candidate.employeeId}
                                </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                                {candidate.department || "—"}
                            </td>

                            <td className="px-5 py-4">
                                <StatusBadge
                                    active={candidate.hasSignedIn}
                                    activeLabel="Signed In"
                                    inactiveLabel="Not Signed In"
                                />
                            </td>

                            <td className="px-5 py-4">
                                <StatusBadge
                                    active={candidate.isActive}
                                    activeLabel="Active"
                                    inactiveLabel="Inactive"
                                />
                            </td>

                            <td className="px-5 py-4 text-right">
                                <Link
                                    href={`/services/employer/candidate-ids/${candidate.employeeId}`}
                                    className="text-sm font-semibold text-primary hover:underline"
                                >
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatusBadge({
    active,
    activeLabel,
    inactiveLabel,
}: {
    active: boolean;
    activeLabel: string;
    inactiveLabel: string;
}) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                active
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
            }`}
        >
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*                                Pagination                                  */
/* -------------------------------------------------------------------------- */

function Pagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </button>

                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                States                                      */
/* -------------------------------------------------------------------------- */

function LoadingState() {
    return (
        <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="h-14 animate-pulse rounded-xl bg-gray-100"
                />
            ))}
        </div>
    );
}

function ErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div className="p-10 text-center">
            <p className="text-sm font-medium text-red-600">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
                Try again
            </button>
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
        <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-5 w-5 text-gray-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
                {hasFilters
                    ? "No candidates found"
                    : "No candidates yet"}
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                {hasFilters
                    ? "Try adjusting your search or filters."
                    : "Create your first candidate to get started."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}