"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";
type Role = "employee" | "employer";

const copy = {
    login: {
        eyebrow: "Welcome back",
        title: "Sign in to SkillKwiz",
        description: "Continue where your skill journey left off.",
        action: "Sign in",
        switchText: "New to SkillKwiz?",
        switchAction: "Create an account",
        switchHref: "/signup",
    },
    signup: {
        eyebrow: "Start with clarity",
        title: "Create your account",
        description: "Set up your SkillKwiz workspace in a few moments.",
        action: "Create account",
        switchText: "Already have an account?",
        switchAction: "Sign in",
        switchHref: "/login",
    },
} as const;

export default function AuthPageForm({ mode }: { mode: AuthMode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const reduceMotion = useReducedMotion();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [message, setMessage] = useState("");
    const role: Role =
        searchParams.get("role") === "employer" ? "employer" : "employee";
    const isSubmitted = searchParams.get("submitted") === "1";
    const content = copy[mode];

    const setRole = (nextRole: Role) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("role", nextRole);
        params.delete("submitted");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        setMessage("");
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set("submitted", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        setMessage(
            mode === "login"
                ? "You’re signed in for this frontend preview."
                : "Your account is ready for this frontend preview.",
        );
    };

    const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };
    const submittedMessage =
        mode === "login"
            ? "You’re signed in for this frontend preview."
            : "Your account is ready for this frontend preview.";

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7"
        >
            <p className="text-sm font-semibold text-secondary uppercase tracking-wide">
                {content.eyebrow}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {content.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {content.description}
            </p>
            <div
                className="mt-6 grid grid-cols-2 rounded-xl bg-muted p-1"
                role="group"
                aria-label="Account type"
            >
                {(["employee", "employer"] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setRole(option)}
                        className={cn(
                            "relative rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors",
                            role === option
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {role === option && (
                            <motion.span
                                layoutId="auth-role"
                                className="absolute inset-0 -z-0 rounded-lg bg-card shadow-sm"
                                transition={{
                                    type: "spring",
                                    stiffness: 360,
                                    damping: 30,
                                }}
                            />
                        )}
                        <span className="relative z-10">{option}</span>
                    </button>
                ))}
            </div>
            {(message || isSubmitted) && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary"
                >
                    {message || submittedMessage}
                </motion.p>
            )}
            <form onSubmit={submit} className="mt-6 space-y-4">
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
                    onToggle={() => setShowPassword((value) => !value)}
                    autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                    }
                />
                {mode === "signup" && (
                    <PasswordField
                        label="Confirm password"
                        id="confirm-password"
                        visible={showConfirmation}
                        onToggle={() => setShowConfirmation((value) => !value)}
                        autoComplete="new-password"
                    />
                )}
                {mode === "login" && (
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-muted-foreground">
                            <input
                                type="checkbox"
                                className="size-4 accent-primary"
                            />{" "}
                            Remember me
                        </label>
                        <a
                            href="#"
                            className="font-medium text-secondary hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>
                )}
                {mode === "signup" && (
                    <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                        <input
                            required
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
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
                    </label>
                )}
                <Button type="submit" className="w-full rounded-lg">
                    {content.action}
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                {content.switchText}{" "}
                <Link
                    href={`${content.switchHref}?role=${role}`}
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
            <span className="mb-2 block text-sm font-medium">{label}</span>
            <span className="relative block">
                <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    required
                    id={id}
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
            <span className="mb-2 block text-sm font-medium">{label}</span>
            <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    required
                    id={id}
                    type={visible ? "text" : "password"}
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
