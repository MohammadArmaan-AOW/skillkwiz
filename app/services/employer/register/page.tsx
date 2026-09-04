import EmployerRegistration from "@/components/employer-registeration";
import { WorkflowShell } from "@/components/services-workflow-shell";
export default function Page() {
    return (
        <WorkflowShell
            role="employer"
            title="Create your employer workspace"
            description="Set up the person and payment authorization responsible for candidate assessments."
        >
            <EmployerRegistration />
        </WorkflowShell>
    );
}
