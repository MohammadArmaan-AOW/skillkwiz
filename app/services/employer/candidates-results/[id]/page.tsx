import EmployerCandidateResult from "@/components/employer-candidate-result";

import { WorkflowShell } from "@/components/services-workflow-shell";

interface PageProps {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        assessmentId?: string;
    }>;
}

export default async function Page({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { assessmentId } = await searchParams;

    /*
     * [id] represents the employeeId.
     *
     * assessmentId is intentionally passed through
     * the query string because the candidate result
     * belongs to a specific assessment.
     */

    if (!id) {
        return (
            <WorkflowShell
                role="employer"
                currentHref="/services/employer/candidates-results"
                title="Candidate result"
                description="Review candidate assessment performance."
                backHref="/services/employer/candidates-results"
                backLabel="Back to candidate results"
            >
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <h2 className="font-semibold">
                        Candidate information is missing
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Please return to candidate results and select a
                        candidate first.
                    </p>
                </div>
            </WorkflowShell>
        );
    }

    /*
     * Assessment ID is required because the same employee can
     * potentially be assigned to multiple assessments.
     */
    if (!assessmentId) {
        return (
            <WorkflowShell
                role="employer"
                currentHref={`/services/employer/candidates-results/${id}`}
                title="Candidate result"
                description="Review candidate assessment performance."
                backHref="/services/employer/candidates-results"
                backLabel="Back to candidate results"
            >
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <h2 className="font-semibold">
                        Assessment information is missing
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Please return to candidate results and select an
                        assessment first.
                    </p>
                </div>
            </WorkflowShell>
        );
    }

    return (
        <WorkflowShell
            role="employer"
            currentHref={`/services/employer/candidates-results/${id}?assessmentId=${assessmentId}`}
            title="Candidate result"
            description="Review candidate assessment performance, answers, grading, and evaluation."
            backHref="/services/employer/candidates-results"
            backLabel="Back to candidates"
        >
            <EmployerCandidateResult
                assessmentId={assessmentId}
                employeeId={id}
            />
        </WorkflowShell>
    );
}
