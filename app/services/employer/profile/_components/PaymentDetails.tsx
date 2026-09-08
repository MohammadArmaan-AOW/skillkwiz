"use client";

import {
    CreditCard,
} from "lucide-react";

export default function PaymentDetails() {
    return (
        <section className="min-h-40 rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CreditCard className="size-5" />
                </div>

                <div>
                    <h3 className="font-semibold">
                        Payment details
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your payment method and billing details.
                    </p>
                </div>
            </div>

            <div className="mt-5 min-h-16 rounded-lg border border-dashed border-border bg-muted/20" />
        </section>
    );
}
