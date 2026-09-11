import EmployeeAssessment from "../../_components/EmployeeAssessment";

interface PageProps {
    params: Promise<{
        assessmentId: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { assessmentId } = await params;

    return <EmployeeAssessment assessmentId={assessmentId} />;
}
