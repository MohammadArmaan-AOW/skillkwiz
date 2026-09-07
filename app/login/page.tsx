"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { motion, useReducedMotion } from "framer-motion";

import {
    ArrowLeft,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

import AuthPageForm from "@/components/auth-page-form";

type LoginRole = "employee" | "employer";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const reduceMotion = useReducedMotion();

    const role: LoginRole =
        searchParams.get("role") === "employee"
            ? "employee"
            : "employer";

    const handleRoleChange = (nextRole: LoginRole) => {
        const params = new URLSearchParams(
            searchParams.toString(),
        );

        params.set("role", nextRole);

        router.replace(
            `/login?${params.toString()}`,
            {
                scroll: false,
            },
        );
    };

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-5 pb-10 pt-28 sm:px-6">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--primary)/.17),transparent_28%),radial-gradient(circle_at_85%_85%,hsl(var(--secondary)/.11),transparent_28%)]" />

            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
                <motion.div
                    initial={
                        reduceMotion
                            ? false
                            : { opacity: 0, x: -20 }
                    }
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className="max-w-lg"
                >
                    <div className="flex items-start gap-5">
                        <Link
                            href="/services"
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to solutions
                        </Link>

                        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.14em] text-secondary">
                            <Sparkles className="size-3.5" />
                            SkillKwiz access
                        </div>
                    </div>

                    <h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
                        Every great decision starts with a{" "}
                        <span className="text-primary">
                            clearer signal.
                        </span>
                    </h2>

                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        Access the workspace that helps
                        you understand skills and act on
                        what you learn.
                    </p>

                    <div className="mt-7 space-y-3">
                        {[
                            "Choose the account type that fits your work",
                            "Keep your learning and talent decisions in one place",
                            "Move from assessment to insight with confidence",
                        ].map((item) => (
                            <p
                                key={item}
                                className="flex items-center gap-2 text-sm text-foreground/80"
                            >
                                <CheckCircle2 className="size-4 text-secondary" />
                                {item}
                            </p>
                        ))}
                    </div>
                </motion.div>

                <div className="mx-auto w-full max-w-md">
                    <div className="mb-4 grid grid-cols-2 rounded-xl border border-border bg-card p-1">
                        <button
                            type="button"
                            onClick={() =>
                                handleRoleChange("employee")
                            }
                            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                role === "employee"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Employee
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleRoleChange("employer")
                            }
                            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                role === "employer"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Employer
                        </button>
                    </div>

                    <AuthPageForm
                        mode="login"
                        role={role}
                    />
                </div>
            </div>
        </main>
    );
}