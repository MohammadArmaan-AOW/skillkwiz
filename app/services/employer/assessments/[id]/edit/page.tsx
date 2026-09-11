import { WorkflowShell } from "@/components/services-workflow-shell";
import EmployerAssessmentEdit from "../../_components/EmployerAssessmentEdit";

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
            currentHref={`/services/employer/assessments/${id}/edit`}
            title="Edit assessment"
            description="Update the assessment details, questions, timing, security, and result settings."
            backHref={`/services/employer/assessments/${id}`}
            backLabel="Back to assessment"
        >
            <EmployerAssessmentEdit assessmentId={id} />
        </WorkflowShell>
    );
}
