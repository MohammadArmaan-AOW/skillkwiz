"use client";

import { useState } from "react";
import { WorkflowShell } from "@/components/services-workflow-shell";
import CandidateForm from "./_components/CandidateForm";
import CandidateList from "./_components/candidate-list";
import { Button } from "@/components/ui/button";

export default function Page() {
    const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);

    return (
        <WorkflowShell
            role="employer"
            currentHref="/services/employer/candidate-ids"
            title="Candidate IDs"
            description="Create and manage candidate accounts for your assessments."
            backHref="/services/employer/profile"
            backLabel="Back to profile"
        >
            <div className="space-y-5">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Candidates
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage candidate accounts and their assessment access.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsCreateCandidateOpen(true)}
                    >
                        <span className="text-lg leading-none">+</span>
                        Create Candidate
                    </Button>
                </div>

                {/* Candidate List */}
                <CandidateList />

                {/* Create Candidate Modal */}
                <CandidateForm
                    isOpen={isCreateCandidateOpen}
                    onClose={() => setIsCreateCandidateOpen(false)}
                />
            </div>
        </WorkflowShell>
    );
}