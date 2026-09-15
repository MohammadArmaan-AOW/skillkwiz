import EmployerCandidates from "@/components/employer-candidates";

interface PageProps {
    searchParams: Promise<{
        assessmentId?: string;
    }>;
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;

    return <EmployerCandidates assessmentId={params.assessmentId ?? null} />;
}
