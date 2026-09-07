"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { motion, useReducedMotion } from "framer-motion";

import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/hooks/queries/employer/useResetPassword";

export default function ResetPasswordPage() {
    const reduceMotion = useReducedMotion();
    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [isReset, setIsReset] = useState(false);

    const { mutate: resetPassword, isPending, error } = useResetPassword();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            return;
        }

        resetPassword(
            {
                token,
                password,
                confirmPassword,
            },
            {
                onSuccess: () => {
                    setIsReset(true);
                },
            },
        );
    };

    const transition = {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
    };

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-5 pb-10 pt-28 sm:px-6">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--primary)/.17),transparent_28%),radial-gradient(circle_at_85%_85%,hsl(var(--secondary)/.11),transparent_28%)]" />

            <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-md items-center justify-center">
                <motion.div
                    initial={
                        reduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  y: 20,
                              }
                    }
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={transition}
                    className="w-full rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7"
                >
                    {isReset ? (
                        <motion.div
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          scale: 0.98,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            transition={transition}
                            className="text-center"
                        >
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle2 className="size-6 text-primary" />
                            </div>

                            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-secondary">
                                Password updated
                            </p>

                            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                                You're all set
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Your password has been successfully changed. You
                                can now sign in with your new password.
                            </p>

                            <Link
                                href="/login"
                                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
                            >
                                <ArrowLeft className="size-4" />
                                Go to sign in
                            </Link>
                        </motion.div>
                    ) : !token ? (
                        <div className="text-center">
                            <p className="text-sm font-semibold uppercase tracking-wide text-destructive">
                                Invalid reset link
                            </p>

                            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                                Reset link is missing
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                This password reset link is invalid or
                                incomplete. Please request a new reset link.
                            </p>

                            <Link
                                href="/forgot-password"
                                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
                            >
                                <ArrowLeft className="size-4" />
                                Request a new link
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                                Back to sign in
                            </Link>

                            <div className="mt-7">
                                <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
                                    Account recovery
                                </p>

                                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                                    Create a new password
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Choose a strong password for your SkillKwiz
                                    employer account.
                                </p>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{
                                        opacity: 0,
                                        y: -5,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    className="mt-5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                                >
                                    {error.message}
                                </motion.p>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-6 space-y-4"
                            >
                                <PasswordField
                                    label="New password"
                                    value={password}
                                    onChange={setPassword}
                                    visible={showPassword}
                                    onToggle={() =>
                                        setShowPassword((value) => !value)
                                    }
                                    autoComplete="new-password"
                                />

                                <PasswordField
                                    label="Confirm new password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    visible={showConfirmation}
                                    onToggle={() =>
                                        setShowConfirmation((value) => !value)
                                    }
                                    autoComplete="new-password"
                                />

                                <Button
                                    type="submit"
                                    disabled={
                                        isPending ||
                                        !password ||
                                        !confirmPassword
                                    }
                                    className="w-full rounded-lg"
                                >
                                    {isPending
                                        ? "Updating password..."
                                        : "Reset password"}
                                </Button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </main>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    visible,
    onToggle,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggle: () => void;
    autoComplete: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>

            <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                    required
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete={autoComplete}
                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                    {visible ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </button>
            </span>
        </label>
    );
}
