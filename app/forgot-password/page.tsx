"use client";

import { useState } from "react";
import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/hooks/queries/employer/useForgotPassword";

export default function ForgotPasswordPage() {
    const reduceMotion = useReducedMotion();

    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { mutate: forgotPassword, isPending, error } = useForgotPassword();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        forgotPassword(
            {
                email: email.trim().toLowerCase(),
            },
            {
                onSuccess: () => {
                    setIsSubmitted(true);
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
                    {!isSubmitted ? (
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
                                    Forgot your password?
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Enter the email address associated with your
                                    employer account and we'll send you a link
                                    to reset your password.
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
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium">
                                        Email
                                    </span>

                                    <span className="relative block">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </span>
                                </label>

                                <Button
                                    type="submit"
                                    disabled={isPending || !email.trim()}
                                    className="w-full rounded-lg"
                                >
                                    {isPending
                                        ? "Sending..."
                                        : "Send reset link"}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Remember your password?{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold text-secondary hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </>
                    ) : (
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
                                Check your inbox
                            </p>

                            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                                Reset link sent
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                If an account exists for{" "}
                                <span className="font-medium text-foreground">
                                    {email}
                                </span>
                                , you will receive an email with instructions to
                                reset your password.
                            </p>

                            <Link
                                href="/login"
                                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
                            >
                                <ArrowLeft className="size-4" />
                                Back to sign in
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
