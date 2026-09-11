import EmployerAssessmentRequest from "@/components/employer-assessment-request";
import { WorkflowShell } from "@/components/services-workflow-shell";

export default function Page() {
    return (
        <WorkflowShell
            role="employer"
            currentHref="/services/employer/assessments/new"
            title="Create an assessment"
            description="Build a skill-focused assessment, configure its timing and security, and invite a candidate to complete it."
            backHref="/services/employer/assessments"
            backLabel="Back to assessments"
        >
            <EmployerAssessmentRequest />
        </WorkflowShell>
    );
}
