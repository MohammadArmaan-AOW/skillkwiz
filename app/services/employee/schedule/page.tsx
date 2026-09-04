import ScheduleAssessment from "@/components/schedule-assessment";
import { WorkflowShell } from "@/components/services-workflow-shell";
export default function Page() {
    return (
        <WorkflowShell
            role="employee"
            title="Schedule your assessment"
            description="Choose the invitation, centre, date, and time that work best for you."
            backHref="/services/employee/register"
            backLabel="Back to registration"
        >
            <ScheduleAssessment />
        </WorkflowShell>
    );
}
