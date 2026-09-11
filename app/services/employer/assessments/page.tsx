import { WorkflowShell } from "@/components/services-workflow-shell";
import EmployerAssessmentsList from "./_components/EmployerAssessmentsList";

export default function Page() {
    return (
        <WorkflowShell
            role="employer"
            currentHref="/services/employer/assessments"
            title="Assessments"
            description="Create, manage, and review skill-focused assessments for your candidates."
        >
            <EmployerAssessmentsList />
        </WorkflowShell>
    );
}
