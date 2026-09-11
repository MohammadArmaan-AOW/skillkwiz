import { WorkflowShell } from "@/components/services-workflow-shell";
import EmployerAssessmentView from "../_components/EmployerAssessmentView";

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
            currentHref={`/services/employer/assessments/${id}`}
            title="Assessment details"
            description="Review the assessment configuration, candidates, schedule, security settings, and questions."
            backHref="/services/employer/assessments"
            backLabel="Back to assessments"
        >
            <EmployerAssessmentView assessmentId={id} />
        </WorkflowShell>
    );
}