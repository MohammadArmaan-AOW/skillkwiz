import EmployerProfile from "@/components/employer-profile";
import { WorkflowShell } from "@/components/services-workflow-shell";
export default function Page() {
    return (
        <WorkflowShell
            role="employer"
            currentHref="/services/employer/profile"
            title="Your organization"
            description="Review the account that manages assessments and candidate results."
            backHref="/services"
            backLabel="Back to Services"
        >
            <EmployerProfile />
        </WorkflowShell>
    );
}
