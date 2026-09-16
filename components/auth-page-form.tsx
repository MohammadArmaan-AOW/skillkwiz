"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
import { useResendEmployerOtp } from "@/hooks/queries/useResendEmployerOtp";

import {
    useEmployeeLogin,
    useVerifyEmployeeOtp,
    useResendEmployeeOtp,
} from "@/hooks/queries/useEmployeeAuth";

type AuthMode = "login" | "signup";
type LoginRole = "employee" | "employer";

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

    /* ---------------------------------------------------------------------- */
    /*                               UI State                                 */
    /* ---------------------------------------------------------------------- */

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    /* Employer verification */
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isVerificationStep, setIsVerificationStep] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    /* Employee verification */
    const [employeeId, setEmployeeId] = useState("");
    const [employeeOtp, setEmployeeOtp] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [isEmployeeVerificationStep, setIsEmployeeVerificationStep] =
        useState(false);

    const [message, setMessage] = useState("");

    /* ---------------------------------------------------------------------- */
    /*                               Employer                                 */
    /* ---------------------------------------------------------------------- */

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
        mutate: resendEmployerOtp,
        isPending: isResendingEmployerOtp,
        error: resendEmployerOtpError,
    } = useResendEmployerOtp();

    const {
        mutate: signIn,
        isPending: isSigningIn,
        error: signInError,
    } = useSignIn();

    /* ---------------------------------------------------------------------- */
    /*                           Employer OTP Timer                            */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (resendCooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setResendCooldown((value) => Math.max(0, value - 1));
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [resendCooldown]);

    /* ---------------------------------------------------------------------- */
    /*                               Employee                                 */
    /* ---------------------------------------------------------------------- */

    const {
        mutate: employeeLogin,
        isPending: isEmployeeSigningIn,
        error: employeeLoginError,
    } = useEmployeeLogin();

    const {
        mutate: verifyEmployeeOtp,
        isPending: isVerifyingEmployeeOtp,
        error: employeeOtpError,
    } = useVerifyEmployeeOtp();

    const {
        mutate: resendEmployeeOtp,
        isPending: isResendingEmployeeOtp,
        error: resendEmployeeOtpError,
    } = useResendEmployeeOtp();

    const content = copy[mode];

    /* ---------------------------------------------------------------------- */
    /*                              Submit Login                              */
    /* ---------------------------------------------------------------------- */

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const password = String(formData.get("password") || "");

        setMessage("");

        /* ------------------------------------------------------------------ */
        /*                                Signup                               */
        /* ------------------------------------------------------------------ */

        if (mode === "signup") {
            const formEmail = String(formData.get("email") || "")
                .trim()
                .toLowerCase();

            const fullName = String(formData.get("name") || "").trim();

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
                        setOtp("");
                        setResendCooldown(0);
                        setIsVerificationStep(true);

                        setMessage(
                            "We sent a 6-digit verification code to your email.",
                        );
                    },
                },
            );

            return;
        }

        /* ------------------------------------------------------------------ */
        /*                              Employer Login                         */
        /* ------------------------------------------------------------------ */

        if (role === "employer") {
            const formEmail = String(formData.get("email") || "")
                .trim()
                .toLowerCase();

            signIn(
                {
                    email: formEmail,
                    password,
                },
                {
                    onSuccess: () => {
                        window.location.href = "/services/employer/profile";
                    },
                },
            );

            return;
        }

        /* ------------------------------------------------------------------ */
        /*                              Employee Login                         */
        /* ------------------------------------------------------------------ */

        const formEmployeeId = String(formData.get("employeeId") || "")
            .trim()
            .toUpperCase();

        employeeLogin(
            {
                employeeId: formEmployeeId,
                password,
            },
            {
                onSuccess: (response) => {
                    console.log("EMPLOYEE LOGIN RESPONSE:", response);

                    if (
                        !response.requiresOtpVerification ||
                        !response.employee
                    ) {
                        setMessage(
                            "Unable to continue. Please try signing in again.",
                        );

                        return;
                    }

                    setEmployeeId(response.employee.employeeId);

                    setEmployeeEmail(response.employee.email);

                    setEmployeeOtp("");

                    setIsEmployeeVerificationStep(true);

                    setMessage(
                        `We sent a 6-digit verification code to ${response.employee.email}.`,
                    );
                },
            },
        );
    };

    /* ---------------------------------------------------------------------- */
    /*                          Employer Email Verification                    */
    /* ---------------------------------------------------------------------- */

    const submitVerification = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (otp.length !== 6) {
            return;
        }

        setMessage("");

        verifyEmail(
            {
                email,
                otp,
            },
            {
                onSuccess: () => {
                    window.location.href = "/services/employer/profile";
                },
            },
        );
    };

    /* ---------------------------------------------------------------------- */
    /*                         Employer Resend OTP                             */
    /* ---------------------------------------------------------------------- */

    const handleResendEmployerOtp = () => {
        if (isResendingEmployerOtp || resendCooldown > 0 || !email) {
            return;
        }

        setMessage("");
        setOtp("");

        resendEmployerOtp(
            {
                email,
            },
            {
                onSuccess: (response) => {
                    setMessage(
                        response.message ||
                            "A new verification code has been sent to your email.",
                    );

                    setResendCooldown(60);
                },
            },
        );
    };

    /* ---------------------------------------------------------------------- */
    /*                           Employee OTP Verification                     */
    /* ---------------------------------------------------------------------- */

    const submitEmployeeVerification = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (employeeOtp.length !== 6) {
            return;
        }

        setMessage("");

        verifyEmployeeOtp(
            {
                employeeId,
                otp: employeeOtp,
            },
            {
                onSuccess: (response) => {
                    console.log(
                        "EMPLOYEE OTP VERIFICATION RESPONSE:",
                        response,
                    );

                    if (!response.success) {
                        setMessage(
                            response.message ||
                                "Unable to complete verification.",
                        );

                        return;
                    }

                    window.location.href = "/services/employee/profile";
                },
            },
        );
    };

    /* ---------------------------------------------------------------------- */
    /*                              Animation                                 */
    /* ---------------------------------------------------------------------- */

    const transition = {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
    };

    /* ---------------------------------------------------------------------- */
    /*                       Employer Email Verification                       */
    /* ---------------------------------------------------------------------- */

    if (mode === "signup" && isVerificationStep) {
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
                    We sent a 6-digit verification code to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    .
                </p>

                {/* Success / information message */}
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

                {/* Verification error */}
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

                {/* OTP form */}
                <form onSubmit={submitVerification} className="mt-6 space-y-4">
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
                                        .replace(/\D/g, "")
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
                            isResendingEmployerOtp ||
                            otp.length !== 6
                        }
                        className="w-full rounded-lg"
                    >
                        {isVerifyingEmail ? "Verifying..." : "Verify Email"}
                    </Button>
                </form>

                {/* Resend error */}
                {resendEmployerOtpError && (
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
                        {resendEmployerOtpError.message}
                    </motion.p>
                )}

                {/* Resend OTP */}
                <button
                    type="button"
                    onClick={handleResendEmployerOtp}
                    disabled={isResendingEmployerOtp || resendCooldown > 0}
                    className="mt-5 w-full text-center text-sm font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isResendingEmployerOtp
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend verification code in ${resendCooldown}s`
                          : "Resend verification code"}
                </button>

                {/* Back to signup */}
                <button
                    type="button"
                    onClick={() => {
                        setIsVerificationStep(false);
                        setOtp("");
                        setEmail("");
                        setMessage("");
                        setResendCooldown(0);
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to sign up
                </button>
            </motion.div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /*                       Employee OTP Verification                        */
    /* ---------------------------------------------------------------------- */

    if (mode === "login" && role === "employee" && isEmployeeVerificationStep) {
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
                    Verify your account
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Check your email
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    We sent a 6-digit verification code to{" "}
                    <span className="font-medium text-foreground">
                        {employeeEmail}
                    </span>
                    .
                </p>

                {/* Information message */}
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

                {/* Verification error */}
                {employeeOtpError && (
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
                        {employeeOtpError.message}
                    </motion.p>
                )}

                {/* Resend error */}
                {resendEmployeeOtpError && (
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
                        {resendEmployeeOtpError.message}
                    </motion.p>
                )}

                {/* Employee OTP form */}
                <form
                    onSubmit={submitEmployeeVerification}
                    className="mt-6 space-y-4"
                >
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium">
                            Verification code
                        </span>

                        <input
                            required
                            value={employeeOtp}
                            onChange={(event) => {
                                setEmployeeOtp(
                                    event.target.value
                                        .replace(/\D/g, "")
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
                            isVerifyingEmployeeOtp ||
                            isResendingEmployeeOtp ||
                            employeeOtp.length !== 6
                        }
                        className="w-full rounded-lg"
                    >
                        {isVerifyingEmployeeOtp
                            ? "Verifying..."
                            : "Verify & Continue"}
                    </Button>
                </form>

                {/* Employee resend */}
                <button
                    type="button"
                    disabled={isResendingEmployeeOtp}
                    onClick={() => {
                        setMessage("");
                        setEmployeeOtp("");

                        resendEmployeeOtp(
                            {
                                employeeId,
                            },
                            {
                                onSuccess: () => {
                                    setMessage(
                                        "A new verification code has been sent to your email.",
                                    );
                                },
                            },
                        );
                    }}
                    className="mt-5 w-full text-center text-sm font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isResendingEmployeeOtp
                        ? "Sending..."
                        : "Resend verification code"}
                </button>

                {/* Back to login */}
                <button
                    type="button"
                    onClick={() => {
                        setIsEmployeeVerificationStep(false);
                        setEmployeeOtp("");
                        setEmployeeEmail("");
                        setEmployeeId("");
                        setMessage("");
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to login
                </button>
            </motion.div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /*                             Main Auth Form                              */
    /* ---------------------------------------------------------------------- */

    const currentError =
        mode === "signup"
            ? signUpError
            : role === "employee"
              ? employeeLoginError
              : signInError;

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

            {/* Employer signup information */}
            {mode === "signup" && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />

                    <p className="text-sm leading-5 text-foreground/80">
                        Employer accounts are used to create assessments, manage
                        candidates, and review results.
                    </p>
                </div>
            )}

            {/* General message */}
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

            {/* General error */}
            {currentError && (
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
                    {currentError.message}
                </motion.p>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
                {/* ---------------------------------------------------------- */}
                {/* Signup Name                                                 */}
                {/* ---------------------------------------------------------- */}

                {mode === "signup" && (
                    <Field
                        label="Full name"
                        id="name"
                        icon={UserRound}
                        placeholder="Your full name"
                        autoComplete="name"
                    />
                )}

                {/* ---------------------------------------------------------- */}
                {/* Employer Email OR Employee ID                              */}
                {/* ---------------------------------------------------------- */}

                {mode === "login" && role === "employee" ? (
                    <Field
                        label="Employee ID"
                        id="employeeId"
                        icon={UserRound}
                        placeholder="e.g. SKEMP-DZYUP9"
                        autoComplete="username"
                    />
                ) : (
                    <Field
                        label="Email"
                        id="email"
                        type="email"
                        icon={Mail}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                )}

                {/* ---------------------------------------------------------- */}
                {/* Password                                                    */}
                {/* ---------------------------------------------------------- */}

                <PasswordField
                    label="Password"
                    id="password"
                    visible={showPassword}
                    onToggle={() => setShowPassword((value) => !value)}
                    autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                    }
                />

                {/* ---------------------------------------------------------- */}
                {/* Confirm Password                                            */}
                {/* ---------------------------------------------------------- */}

                {mode === "signup" && (
                    <PasswordField
                        label="Confirm password"
                        id="confirm-password"
                        visible={showConfirmation}
                        onToggle={() => setShowConfirmation((value) => !value)}
                        autoComplete="new-password"
                    />
                )}

                {/* ---------------------------------------------------------- */}
                {/* Login Options                                               */}
                {/* ---------------------------------------------------------- */}

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
                            href={
                                role === "employee"
                                    ? "/forgot-password?role=employee"
                                    : "/forgot-password"
                            }
                            className="font-medium text-secondary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* Signup Terms                                                */}
                {/* ---------------------------------------------------------- */}

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

                {/* ---------------------------------------------------------- */}
                {/* Submit                                                      */}
                {/* ---------------------------------------------------------- */}

                <Button
                    type="submit"
                    disabled={
                        mode === "signup"
                            ? isSigningUp
                            : role === "employee"
                              ? isEmployeeSigningIn
                              : isSigningIn
                    }
                    className="w-full rounded-lg"
                >
                    {mode === "signup"
                        ? isSigningUp
                            ? "Creating account..."
                            : content.action
                        : role === "employee"
                          ? isEmployeeSigningIn
                              ? "Signing in..."
                              : "Sign in"
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

/* -------------------------------------------------------------------------- */
/*                                   Field                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Password Field                                */
/* -------------------------------------------------------------------------- */

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
                    name={id}
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
