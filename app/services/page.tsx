"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { paths } from "@/lib/data/services";

export default function ServicesPage() {
    const reduce = useReducedMotion();
    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-5 pb-14 pt-28 sm:px-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_12%,hsl(var(--primary)/.2),transparent_32%),radial-gradient(circle_at_12%_84%,hsl(var(--secondary)/.1),transparent_25%)]" />
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mx-auto max-w-5xl"
            >
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold text-secondary uppercase tracking-wide">
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
                        ({ title, copy, href, icon: Icon, action }, index) => (
                            <motion.article
                                key={title}
                                initial={reduce ? false : { opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 + index * 0.08 }}
                                whileHover={reduce ? undefined : { y: -4 }}
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
                                    {(index === 0
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
                                        <li key={item} className="flex gap-2">
                                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Button asChild className="mt-6 w-full">
                                    <Link href={href}>
                                        {action}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </motion.article>
                        ),
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
            </motion.div>
        </main>
    );
}
