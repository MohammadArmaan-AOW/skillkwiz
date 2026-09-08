"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";

type AssessmentAuthorizationProps = {
    isAuthorized: boolean;
};

export default function AssessmentAuthorization({
    isAuthorized,
}: AssessmentAuthorizationProps) {
    return (
        <section className="rounded-xl border border-border bg-muted/30 p-5">
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
                            Your authorization status for assessment activities.
                        </p>
                    </div>
                </div>

                {isAuthorized ? (
                    <div className="flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                        <CheckCircle2 className="size-4" />
                        Authorized
                    </div>
                ) : (
                    <div className="flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                        Authorization required
                    </div>
                )}
            </div>

            <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Authorization details
                </p>

                <div className="mt-2 rounded-lg border border-border bg-background p-4 text-sm leading-6">
                    {isAuthorized
                        ? "Payment details are available and your account is authorized to use assessment services."
                        : "Payment details are required before assessment services can be used."}
                </div>
            </div>
        </section>
    );
}
