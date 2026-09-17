"use client";

import Link from "next/link";

import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import { paths } from "@/lib/data/services";

import { useEmployer } from "@/hooks/queries/employer/useEmployer";

export default function ServicesPage() {

    const { isAuthenticated, isLoading: employerLoading } = useEmployer();

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-5 pb-14 pt-28 sm:px-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_12%,hsl(var(--primary)/.2),transparent_32%),radial-gradient(circle_at_12%_84%,hsl(var(--secondary)/.1),transparent_25%)]" />

            <div

                className="mx-auto max-w-5xl"
            >
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
                        SkillKwiz workspace
                    </p>

                    <h1 className="mt-2 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
                        A clear path from{" "}
                        <span className="text-primary">assessment</span> to
                        action.
                    </h1>

                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        Choose the experience that fits your next step. Each
                        workflow is a frontend preview with URL-backed stages,
                        so it is easy to revisit and navigate.
                    </p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {paths.map(
                        (
                            { role, title, copy, href, icon: Icon, action },
                            index,
                        ) => {
                            const isEmployer = role === "employer";

                            const cardHref =
                                isEmployer && isAuthenticated
                                    ? "/services/employer/profile"
                                    : href;

                            return (
                                <article
                                    className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5"
                                >
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="size-5" />
                                    </div>

                                    <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                                        {title}
                                    </h2>

                                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                                        {copy}
                                    </p>

                                    <ul className="mt-5 space-y-2 text-sm text-foreground/80">
                                        {(role === "employee"
                                            ? [
                                                  "Create your assessment profile",
                                                  "Pick a centre and time",
                                                  "Confirm your appointment",
                                              ]
                                            : [
                                                  "Create your employer workspace",
                                                  "Send and pay for assessments",
                                                  "Review candidate reports",
                                              ]
                                        ).map((item) => (
                                            <li
                                                key={item}
                                                className="flex gap-2"
                                            >
                                                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button asChild className="mt-6 w-full">
                                        <Link href={cardHref}>
                                            {isEmployer && isAuthenticated
                                                ? "Continue to workspace"
                                                : action}

                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </article>
                            );
                        },
                    )}
                </div>

                <div className="mt-7 rounded-xl border border-border bg-muted/35 p-4 text-sm text-muted-foreground">
                    <ClipboardCheck className="mr-2 inline size-4 text-secondary" />
                    Need access to an existing workspace?{" "}
                    <Link
                        className="font-semibold text-secondary hover:underline"
                        href="/login?role=employer"
                    >
                        Sign in
                    </Link>{" "}
                    to continue.
                </div>
            </div>
        </main>
    );
}
