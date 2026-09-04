import EmployeeRegistration from "@/components/employee-registeration";
import { WorkflowShell } from "@/components/services-workflow-shell";
export default function Page() {
    return (
        <WorkflowShell
            role="employee"
            title="Create your assessment profile"
            description="Tell us a little about yourself so we can prepare your assessment journey."
        >
            <EmployeeRegistration />
        </WorkflowShell>
    );
}
