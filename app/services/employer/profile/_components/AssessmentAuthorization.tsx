"use client";

import {
    AlertCircle,
    CheckCircle2,
    Coins,
    Loader2,
    ShieldCheck,
} from "lucide-react";

import { useAssessmentAuthorization } from "@/hooks/queries/employer/useAssessmentAuthorization";

export default function AssessmentAuthorization() {
    const {
        authorized,
        credits,
        profileComplete,
        hasCredits,
        missingDetails,
        isLoading,
        isError,
        error,
        refetch,
    } = useAssessmentAuthorization();

    if (isLoading) {
        return (
            <section className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="size-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold">
                            Assessment authorization
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Your authorization status for assessment
                            activities.
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Checking authorization status...
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="size-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold">
                            Assessment authorization
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Your authorization status for assessment
                            activities.
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-lg border border-border bg-background p-4">
                    <p className="text-sm text-destructive">
                        {error?.message ??
                            "Unable to check authorization status."}
                    </p>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-2 text-sm font-medium text-primary hover:underline"
                    >
                        Try again
                    </button>
                </div>
            </section>
        );
    }

    const missingProfileFields = [
        {
            key: "phoneNumber",
            label: "Phone number",
            missing: missingDetails?.phoneNumber,
        },
        {
            key: "department",
            label: "Department",
            missing: missingDetails?.department,
        },
        {
            key: "companyName",
            label: "Company name",
            missing: missingDetails?.companyName,
        },
        {
            key: "companyAddress",
            label: "Company address",
            missing: missingDetails?.companyAddress,
        },
    ];

    const incompleteFields = missingProfileFields.filter(
        (field) => field.missing,
    );

    return (
        <section className="rounded-xl border border-border bg-muted/30 p-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="size-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold">
                            Assessment authorization
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Your account must have credits and a completed
                            employer profile to access assessment services.
                        </p>
                    </div>
                </div>

                {authorized ? (
                    <div className="flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                        <CheckCircle2 className="size-4" />
                        Authorized
                    </div>
                ) : (
                    <div className="flex w-fit items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
                        <AlertCircle className="size-4" />
                        Authorization required
                    </div>
                )}
            </div>

            {/* Status cards */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {/* Credits */}
                <div className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Coins className="size-4" />
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Available credits
                                </p>

                                <p className="text-lg font-semibold">
                                    {credits}
                                </p>
                            </div>
                        </div>

                        {hasCredits ? (
                            <CheckCircle2 className="size-5 text-primary" />
                        ) : (
                            <AlertCircle className="size-5 text-destructive" />
                        )}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                        {hasCredits
                            ? "You have credits available for assessment services."
                            : "You need at least 1 credit to access assessment services."}
                    </p>
                </div>

                {/* Profile */}
                <div className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ShieldCheck className="size-4" />
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Employer profile
                                </p>

                                <p className="text-sm font-semibold">
                                    {profileComplete
                                        ? "Complete"
                                        : "Incomplete"}
                                </p>
                            </div>
                        </div>

                        {profileComplete ? (
                            <CheckCircle2 className="size-5 text-primary" />
                        ) : (
                            <AlertCircle className="size-5 text-destructive" />
                        )}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                        {profileComplete
                            ? "All required employer details have been provided."
                            : "Complete all required employer details to become authorized."}
                    </p>
                </div>
            </div>

            {/* Authorization details */}
            <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Assessment access
                </p>

                <div className="mt-2 rounded-lg border border-border bg-background p-4">
                    {authorized ? (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-sm font-medium">
                                        Your account is authorized
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        You have sufficient credits and your
                                        employer profile is complete. You can
                                        now create assessments and manage
                                        candidates.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

                                <div>
                                    <p className="text-sm font-medium">
                                        Complete the requirements below
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        You must have at least one credit and
                                        complete all required employer details
                                        before you can access assessment
                                        services.
                                    </p>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    {hasCredits ? (
                                        <CheckCircle2 className="size-4 text-primary" />
                                    ) : (
                                        <AlertCircle className="size-4 text-destructive" />
                                    )}

                                    <span
                                        className={
                                            hasCredits
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        At least 1 credit
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    {profileComplete ? (
                                        <CheckCircle2 className="size-4 text-primary" />
                                    ) : (
                                        <AlertCircle className="size-4 text-destructive" />
                                    )}

                                    <span
                                        className={
                                            profileComplete
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        Complete employer profile
                                    </span>
                                </div>
                            </div>

                            {/* Missing profile details */}
                            {!profileComplete &&
                                incompleteFields.length > 0 && (
                                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                                        <p className="text-sm font-medium text-foreground">
                                            Missing profile details
                                        </p>

                                        <ul className="mt-2 space-y-1.5">
                                            {incompleteFields.map((field) => (
                                                <li
                                                    key={field.key}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                    <span className="size-1.5 rounded-full bg-destructive" />
                                                    {field.label}
                                                </li>
                                            ))}
                                        </ul>

                                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                                            Please complete these details in
                                            your employer profile. Your
                                            assessment access will become
                                            available automatically once all
                                            requirements are satisfied.
                                        </p>
                                    </div>
                                )}

                            {/* Credits warning */}
                            {!hasCredits && (
                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                    <div className="flex items-start gap-3">
                                        <Coins className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                        <div>
                                            <p className="text-sm font-medium">
                                                Credits required
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                Purchase credits to unlock
                                                assessment services. You will
                                                still need to complete your
                                                employer profile.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}