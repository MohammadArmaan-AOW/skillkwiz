"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";
import { useResendEmployerOtp } from "@/hooks/queries/useResendEmployerOtp";

import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

import AuthPageForm from "@/components/auth-page-form";

import { useSignUp } from "@/hooks/queries/employer/useSignUp";
import { useVerifyEmail } from "@/hooks/queries/employer/useVerifyEmail";

import EmailVerificationForm from "./_components/EmailVerificationForm";

export default function SignUpPage() {
    const router = useRouter();
    const reduceMotion = useReducedMotion();

    const [isVerificationStep, setIsVerificationStep] = useState(false);

    const [email, setEmail] = useState("");

    const {
        mutate: signUp,
        isPending: isSigningUp,
        error: signUpError,
    } = useSignUp();

    const {
        mutate: resendOtp,
        isPending: isResendingOtp,
        error: resendOtpError,
    } = useResendEmployerOtp();

    const {
        mutate: verifyEmail,
        isPending: isVerifying,
        error: verifyEmailError,
    } = useVerifyEmail();

    const handleSignUp = (data: {
        fullName: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        signUp(data, {
            onSuccess: (response) => {
                setEmail(response.data?.email || data.email);

                setIsVerificationStep(true);
            },
        });
    };

    const handleResendOtp = () => {
        resendOtp({
            email,
        });
    };

    const handleVerifyEmail = (otp: string) => {
        verifyEmail(
            {
                email,
                otp,
            },
            {
                onSuccess: () => {
                    router.replace("/services/employer/profile");
                },
            },
        );
    };

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-5 pb-10 pt-28 sm:px-6">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_85%_12%,hsl(var(--primary)/.2),transparent_30%),radial-gradient(circle_at_10%_80%,hsl(var(--secondary)/.12),transparent_28%)]" />

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
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to solutions
                    </Link>

                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.14em] text-primary">
                        <Sparkles className="size-3.5" />
                        Employer access
                    </div>

                    <h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
                        Build a stronger team with{" "}
                        <span className="text-primary">confidence.</span>
                    </h2>

                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        Create your SkillKwiz employer account to assess skills,
                        manage candidates, and make better hiring decisions.
                    </p>

                    <div className="mt-7 space-y-3">
                        {[
                            "Create and manage candidate assessments",
                            "Evaluate skills with structured assessments",
                            "Get meaningful insights into candidate performance",
                        ].map((item) => (
                            <p
                                key={item}
                                className="flex items-center gap-2 text-sm text-foreground/80"
                            >
                                <CheckCircle2 className="size-4 text-primary" />
                                {item}
                            </p>
                        ))}
                    </div>
                </motion.div>

                <div className="mx-auto w-full max-w-md">
                    {isVerificationStep ? (
                        <EmailVerificationForm
                            email={email}
                            isLoading={isVerifying}
                            error={verifyEmailError?.message}
                            resendError={resendOtpError?.message}
                            isResending={isResendingOtp}
                            onSubmit={handleVerifyEmail}
                            onResend={handleResendOtp}
                        />
                    ) : (
                        <AuthPageForm
                            mode="signup"
                            isLoading={isSigningUp}
                            error={signUpError?.message}
                            onSubmit={handleSignUp}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
