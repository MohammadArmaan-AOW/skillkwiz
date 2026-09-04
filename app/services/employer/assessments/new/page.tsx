import EmployerAssessmentRequest from "@/components/employer-assessment-request";
import { WorkflowShell } from "@/components/services-workflow-shell";
export default function Page() {
    return (
        <WorkflowShell
            role="employer"
            currentHref="/services/employer/assessments/new"
            title="Create an assessment"
            description="Invite a candidate, select the skills to assess, and authorize the assessment payment."
            backHref="/services/employer/profile"
            backLabel="Back to profile"
        >
            <EmployerAssessmentRequest />
        </WorkflowShell>
    );
}
