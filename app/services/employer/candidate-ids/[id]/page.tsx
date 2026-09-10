import { WorkflowShell } from "@/components/services-workflow-shell";
import CandidateDetails from "./_components/candidate-details";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;

    return (
        <WorkflowShell
            role="employer"
            currentHref={`/services/employer/candidate-ids/${id}`}
            title="Candidate Details"
            description="View and manage candidate account information."
            backHref="/services/employer/candidate-ids"
            backLabel="Back to candidates"
        >
            <CandidateDetails employeeId={id} />
        </WorkflowShell>
    );
}