"use client";

import Link from "next/link";
import { useState } from "react";

import { motion, useReducedMotion } from "framer-motion";

import {
    ArrowLeft,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Sparkles,
    UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSignIn } from "@/hooks/queries/employer/useSignIn";
import { useSignUp } from "@/hooks/queries/employer/useSignUp";
import { useVerifyEmail } from "@/hooks/queries/employer/useVerifyEmail";

type AuthMode = "login" | "signup";
type LoginRole = "employee" | "employer";

const copy = {
    login: {
        eyebrow: "Welcome back",
        title: "Sign in to SkillKwiz",
        description:
            "Continue where your skill journey left off.",
        action: "Sign in",
        switchText: "New to SkillKwiz?",
        switchAction: "Create an account",
        switchHref: "/signup",
    },

    signup: {
        eyebrow: "Start with clarity",
        title: "Create your employer account",
        description:
            "Set up your SkillKwiz employer workspace in a few moments.",
        action: "Create account",
        switchText: "Already have an account?",
        switchAction: "Sign in",
        switchHref: "/login",
    },
} as const;

export default function AuthPageForm({
    mode,
    role,
}: {
    mode: AuthMode;
    role?: LoginRole;
}) {
    const reduceMotion = useReducedMotion();

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmation, setShowConfirmation] =
        useState(false);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [isVerificationStep, setIsVerificationStep] =
        useState(false);

    const [message, setMessage] = useState("");

    const {
        mutate: signUp,
        isPending: isSigningUp,
        error: signUpError,
    } = useSignUp();

    const {
        mutate: verifyEmail,
        isPending: isVerifyingEmail,
        error: verifyEmailError,
    } = useVerifyEmail();

    const {
        mutate: signIn,
        isPending: isSigningIn,
        error: signInError,
    } = useSignIn();

    const content = copy[mode];

    const submit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const formData = new FormData(
            event.currentTarget,
        );

        const formEmail = String(
            formData.get("email") || "",
        )
            .trim()
            .toLowerCase();

        const password = String(
            formData.get("password") || "",
        );

        setMessage("");

        if (mode === "signup") {
            const fullName = String(
                formData.get("name") || "",
            ).trim();

            const confirmPassword = String(
                formData.get("confirm-password") || "",
            );

            signUp(
                {
                    fullName,
                    email: formEmail,
                    password,
                    confirmPassword,
                },
                {
                    onSuccess: () => {
                        setEmail(formEmail);
                        setIsVerificationStep(true);
                        setMessage(
                            "We sent a 6-digit verification code to your email.",
                        );
                    },
                },
            );

            return;
        }

        if (role === "employer") {
            signIn(
                {
                    email: formEmail,
                    password,
                },
                {
                    onSuccess: () => {
                        window.location.href =
                            "/services/employer/profile";
                    },
                },
            );

            return;
        }

        setMessage(
            "Employee sign in will be connected next.",
        );
    };

    const submitVerification = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setMessage("");

        verifyEmail(
            {
                email,
                otp,
            },
            {
                onSuccess: () => {
                    window.location.href =
                        "/services/employer/profile";
                },
            },
        );
    };

    const error =
        mode === "signup"
            ? signUpError
            : signInError;

    const transition = {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
    };

    if (
        mode === "signup" &&
        isVerificationStep
    ) {
        return (
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
                className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7"
            >
                <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
                    Verify your email
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Check your inbox
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    We sent a 6-digit verification
                    code to{" "}
                    <span className="font-medium text-foreground">
                        {email}
                    </span>
                    .
                </p>

                {message && (
                    <motion.p
                        initial={{
                            opacity: 0,
                            y: -5,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="mt-4 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary"
                    >
                        {message}
                    </motion.p>
                )}

                {verifyEmailError && (
                    <motion.p
                        initial={{
                            opacity: 0,
                            y: -5,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {verifyEmailError.message}
                    </motion.p>
                )}

                <form
                    onSubmit={submitVerification}
                    className="mt-6 space-y-4"
                >
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium">
                            Verification code
                        </span>

                        <input
                            required
                            value={otp}
                            onChange={(event) => {
                                setOtp(
                                    event.target.value
                                        .replace(
                                            /\D/g,
                                            "",
                                        )
                                        .slice(0, 6),
                                );
                            }}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="000000"
                            className="h-12 w-full rounded-lg border border-border bg-background px-4 text-center text-lg tracking-[0.5em] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </label>

                    <Button
                        type="submit"
                        disabled={
                            isVerifyingEmail ||
                            otp.length !== 6
                        }
                        className="w-full rounded-lg"
                    >
                        {isVerifyingEmail
                            ? "Verifying..."
                            : "Verify Email"}
                    </Button>
                </form>

                <button
                    type="button"
                    onClick={() => {
                        setIsVerificationStep(false);
                        setOtp("");
                        setMessage("");
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to sign up
                </button>
            </motion.div>
        );
    }

    return (
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
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7"
        >
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
                {content.eyebrow}
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {content.title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {content.description}
            </p>

            {mode === "signup" && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />

                    <p className="text-sm leading-5 text-foreground/80">
                        Employer accounts are used to
                        create assessments, manage
                        candidates, and review results.
                    </p>
                </div>
            )}

            {message && (
                <motion.p
                    initial={{
                        opacity: 0,
                        y: -5,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mt-4 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary"
                >
                    {message}
                </motion.p>
            )}

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
                    className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {error.message}
                </motion.p>
            )}

            <form
                onSubmit={submit}
                className="mt-6 space-y-4"
            >
                {mode === "signup" && (
                    <Field
                        label="Full name"
                        id="name"
                        icon={UserRound}
                        placeholder="Your full name"
                        autoComplete="name"
                    />
                )}

                <Field
                    label="Email"
                    id="email"
                    type="email"
                    icon={Mail}
                    placeholder="you@example.com"
                    autoComplete="email"
                />

                <PasswordField
                    label="Password"
                    id="password"
                    visible={showPassword}
                    onToggle={() =>
                        setShowPassword(
                            (value) => !value,
                        )
                    }
                    autoComplete={
                        mode === "login"
                            ? "current-password"
                            : "new-password"
                    }
                />

                {mode === "signup" && (
                    <PasswordField
                        label="Confirm password"
                        id="confirm-password"
                        visible={showConfirmation}
                        onToggle={() =>
                            setShowConfirmation(
                                (value) => !value,
                            )
                        }
                        autoComplete="new-password"
                    />
                )}

                {mode === "login" && (
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-muted-foreground">
                            <input
                                type="checkbox"
                                className="size-4 accent-primary"
                            />
                            Remember me
                        </label>

                        <Link
                            href="/forgot-password"
                            className="font-medium text-secondary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                )}

                {mode === "signup" && (
                    <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                        <input
                            required
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                        />

                        <span>
                            I agree to the{" "}
                            <a
                                href="#"
                                className="font-medium text-primary hover:underline"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="#"
                                className="font-medium text-primary hover:underline"
                            >
                                Privacy Policy
                            </a>
                            .
                        </span>
                    </label>
                )}

                <Button
                    type="submit"
                    disabled={
                        mode === "signup"
                            ? isSigningUp
                            : isSigningIn
                    }
                    className="w-full rounded-lg"
                >
                    {mode === "signup"
                        ? isSigningUp
                            ? "Creating account..."
                            : content.action
                        : isSigningIn
                            ? "Signing in..."
                            : content.action}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                {content.switchText}{" "}

                <Link
                    href={content.switchHref}
                    className="font-semibold text-secondary hover:underline"
                >
                    {content.switchAction}
                </Link>
            </p>
        </motion.div>
    );
}

function Field({
    label,
    id,
    type = "text",
    icon: Icon,
    placeholder,
    autoComplete,
}: {
    label: string;
    id: string;
    type?: string;
    icon: typeof Mail;
    placeholder: string;
    autoComplete: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">
                {label}
            </span>

            <span className="relative block">
                <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                    required
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </span>
        </label>
    );
}

function PasswordField({
    label,
    id,
    visible,
    onToggle,
    autoComplete,
}: {
    label: string;
    id: string;
    visible: boolean;
    onToggle: () => void;
    autoComplete: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">
                {label}
            </span>

            <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                    required
                    id={id}
                    name={id}
                    type={
                        visible
                            ? "text"
                            : "password"
                    }
                    placeholder="Enter your password"
                    autoComplete={autoComplete}
                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={
                        visible
                            ? "Hide password"
                            : "Show password"
                    }
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