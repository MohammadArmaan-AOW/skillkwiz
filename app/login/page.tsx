"use client";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

import AuthPageForm from "@/components/auth-page-form";
import { toast } from "sonner";
import { useEffect } from "react";

type LoginRole = "employee" | "employer";

export default function LoginPage() {
    const router = useRouter();

    const searchParams = useSearchParams();

    const reduceMotion = useReducedMotion();

    const role: LoginRole =
        searchParams.get("role") === "employee" ? "employee" : "employer";

    const handleRoleChange = (nextRole: LoginRole) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set("role", nextRole);

        router.replace(`/login?${params.toString()}`, {
            scroll: false,
        });
    };

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/employer/google";
    };

    useEffect(() => {
        const error = searchParams.get("error");

        if (!error) {
            return;
        }

        if (error === "google_account_not_registered") {
            toast.error("No employer account found", {
                description:
                    "Please sign up for a SkillKwiz employer account before using Google login.",
            });
        }

        const params = new URLSearchParams(searchParams.toString());

        params.delete("error");

        const query = params.toString();

        router.replace(query ? `/login?${query}` : "/login", {
            scroll: false,
        });
    }, [searchParams, router]);

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-5 pb-10 pt-28 sm:px-6">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--primary)/.17),transparent_28%),radial-gradient(circle_at_85%_85%,hsl(var(--secondary)/.11),transparent_28%)]" />

            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
                <motion.div
                    initial={
                        reduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  x: -20,
                              }
                    }
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
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
                        <span className="text-primary">clearer signal.</span>
                    </h2>

                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        Access the workspace that helps you understand skills
                        and act on what you learn.
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
                            onClick={() => handleRoleChange("employee")}
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
                            onClick={() => handleRoleChange("employer")}
                            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                role === "employer"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Employer
                        </button>
                    </div>

                    <AuthPageForm mode="login" role={role} />

                    {role === "employer" && (
                        <div className="mt-5">
                            <div className="relative flex items-center">
                                <div className="h-px flex-1 bg-border" />

                                <span className="px-3 text-xs text-muted-foreground">
                                    OR
                                </span>

                                <div className="h-px flex-1 bg-border" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="size-5"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M21.35 12.27c0-.7-.06-1.38-.18-2.03H12v3.84h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.2Z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.09.31-1.59V7.88H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.12l3.24-2.53Z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.46 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                                Google login is only available for employers who
                                already have a SkillKwiz account.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
