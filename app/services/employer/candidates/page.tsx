import EmployerCandidateList from "@/components/employer-candidate-list";
import { WorkflowShell } from "@/components/services-workflow-shell";
export default function Page() {
    return (
        <WorkflowShell
            role="employer"
            currentHref="/services/employer/candidates"
            title="Candidate results"
            description="Search and review candidate skill signals in one focused workspace."
            backHref="/services/employer/profile"
            backLabel="Back to profile"
        >
            <EmployerCandidateList />
        </WorkflowShell>
    );
}
