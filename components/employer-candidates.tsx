"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import EmployerCandidateList from "@/components/employer-candidate-list";
import EmployerAssessmentSelector from "@/components/employer-assessment-selector";

import { WorkflowShell } from "@/components/services-workflow-shell";
import { Button } from "@/components/ui/button";

interface EmployerCandidatesProps {
    assessmentId: string | null;
}

export default function EmployerCandidates({
    assessmentId,
}: EmployerCandidatesProps) {
    const router = useRouter();

    const handleSelectAssessment = (
        selectedAssessmentId: string,
    ) => {
        const params = new URLSearchParams();

        params.set(
            "assessmentId",
            selectedAssessmentId,
        );

        router.push(
            `/services/employer/candidates-results?${params.toString()}`,
        );
    };

    const handleBackToAssessments = () => {
        router.push(
            "/services/employer/candidates-results",
        );
    };

    return (
        <WorkflowShell
            role="employer"
            currentHref="/services/employer/candidates-results"
            title="Candidate results"
            description="Search and review candidate skill signals in one focused workspace."
            backHref="/services/employer/profile"
            backLabel="Back to profile"
        >
            {assessmentId ? (
                <div className="space-y-6">
                    {/* Back to assessment selection */}
                    <div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={
                                handleBackToAssessments
                            }
                            className="gap-2 px-0"
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Back to assessments
                        </Button>
                    </div>

                    <EmployerCandidateList
                        assessmentId={
                            assessmentId
                        }
                    />
                </div>
            ) : (
                <EmployerAssessmentSelector
                    onSelect={
                        handleSelectAssessment
                    }
                />
            )}
        </WorkflowShell>
    );
}