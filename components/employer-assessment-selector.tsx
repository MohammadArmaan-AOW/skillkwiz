"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    ClipboardCheck,
    Clock3,
    Loader2,
    Search,
    Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAssessment } from "@/hooks/queries/useAssessment";

interface EmployerAssessmentSelectorProps {
    onSelect: (assessmentId: string) => void;
}

export default function EmployerAssessmentSelector({
    onSelect,
}: EmployerAssessmentSelectorProps) {
    const [search, setSearch] = useState("");

    const {
        employerAssessments,
        isEmployerAssessmentsLoading,
        isEmployerAssessmentsFetching,
        employerAssessmentsError,
    } = useAssessment({
        role: "employer",
        employerListParams: {
            search,
            page: 1,
            limit: 50,
        },
    });

    const assessments = employerAssessments?.assessments ?? [];

    if (isEmployerAssessmentsLoading) {
        return (
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">
                        Select an assessment
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose an assessment to view its candidate results.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        disabled
                        placeholder="Search assessments..."
                        className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
                    />
                </div>

                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-xl border border-border bg-muted/30"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (employerAssessmentsError) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <ClipboardCheck className="mx-auto size-8 text-destructive" />

                <h2 className="mt-3 font-semibold">
                    Unable to load assessments
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {employerAssessmentsError.message}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        Select an assessment
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose an assessment to view its candidate results.
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search assessments..."
                        className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {employerAssessments?.total ?? assessments.length}{" "}
                    assessments
                </p>

                {isEmployerAssessmentsFetching && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {assessments.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-border p-10 text-center">
                    <ClipboardCheck className="mx-auto size-8 text-muted-foreground" />

                    <h3 className="mt-3 font-semibold">No assessments found</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {search
                            ? "Try a different search."
                            : "Create an assessment before viewing candidate results."}
                    </p>
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    {assessments.map((assessment: any, index: number) => {
                        const assessmentId = assessment._id ?? assessment.id;

                        const assignedCount =
                            assessment.assignedEmployees?.length ??
                            assessment.assignedEmployeeCount ??
                            0;

                        const questionCount =
                            assessment.questions?.length ??
                            assessment.questionCount ??
                            0;

                        return (
                            <motion.article
                                key={assessmentId}
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: index * 0.04,
                                }}
                                className="rounded-xl border border-border p-5 transition-colors hover:border-primary/40"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <ClipboardCheck className="size-5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold">
                                            {assessment.title}
                                        </h3>

                                        {assessment.description && (
                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                {assessment.description}
                                            </p>
                                        )}

                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Users className="size-3.5" />
                                                {assignedCount} candidates
                                            </span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <ClipboardCheck className="size-3.5" />
                                                {questionCount} questions
                                            </span>

                                            {assessment.timing
                                                ?.durationMinutes && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock3 className="size-3.5" />
                                                    {
                                                        assessment.timing
                                                            .durationMinutes
                                                    }{" "}
                                                    min
                                                </span>
                                            )}

                                            {assessment.status && (
                                                <span className="rounded-full bg-muted px-2 py-1 capitalize">
                                                    {assessment.status}
                                                </span>
                                            )}
                                        </div>

                                        {assessment.skills?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {assessment.skills.map(
                                                    (skill: string) => (
                                                        <span
                                                            key={skill}
                                                            className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        className="shrink-0"
                                        onClick={() => onSelect(assessmentId)}
                                    >
                                        View results
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
