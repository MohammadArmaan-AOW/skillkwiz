"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    ClipboardCheck,
    UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const employerNavigation = [
    {
        href: "/services/employer/profile",
        label: "Profile",
        icon: BriefcaseBusiness,
    },
    {
        href: "/services/employer/assessments/new",
        label: "New assessment",
        icon: ClipboardCheck,
    },
    {
        href: "/services/employer/candidates",
        label: "Candidates",
        icon: UsersRound,
    },
];

export function WorkflowShell({
    children,
    title,
    description,
    backHref = "/services",
    backLabel = "All services",
    role,
    currentHref,
}: {
    children: ReactNode;
    title: string;
    description: string;
    backHref?: string;
    backLabel?: string;
    role: "employee" | "employer";
    currentHref?: string;
}) {
    const reduceMotion = useReducedMotion();
    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-4 pb-12 pt-28 sm:px-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_0%,hsl(var(--primary)/.16),transparent_30%),radial-gradient(circle_at_8%_85%,hsl(var(--secondary)/.08),transparent_25%)]" />
            <div className="mx-auto max-w-5xl">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" /> {backLabel}
                    </Link>
                    <div className="mt-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase text-secondary tracking-wide">
                                {role} workspace
                            </p>
                            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                                {title}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        {role === "employee" && (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary uppercase tracking-wide">
                                <CalendarDays className="size-4" /> Assessment
                                journey
                            </span>
                        )}
                    </div>
                    {role === "employer" && (
                        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
                            {employerNavigation.map(
                                ({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                                            currentHref === href
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="size-4" />
                                        {label}
                                    </Link>
                                ),
                            )}
                        </nav>
                    )}
                </motion.div>
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7"
                >
                    {children}
                </motion.div>
            </div>
        </main>
    );
}
