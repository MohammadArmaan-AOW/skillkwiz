"use client";

import { useEffect, useState } from "react";

interface EmailVerificationFormProps {
    email: string;
    isLoading: boolean;
    error?: string;
    resendError?: string;
    isResending: boolean;
    onSubmit: (otp: string) => void;
    onResend: () => void;
}

export default function EmailVerificationForm({
    email,
    isLoading,
    error,
    resendError,
    isResending,
    onSubmit,
    onResend,
}: EmailVerificationFormProps) {
    const [otp, setOtp] = useState("");
    const [resendCooldown, setResendCooldown] =
        useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setResendCooldown(
                (value) =>
                    Math.max(
                        0,
                        value - 1,
                    ),
            );
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [resendCooldown]);

    const handleResend = () => {
        if (
            isResending ||
            resendCooldown > 0
        ) {
            return;
        }

        onResend();

        setResendCooldown(60);
        setOtp("");
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();

                onSubmit(otp);
            }}
            className="space-y-5"
        >
            <div>
                <h2 className="text-2xl font-semibold">
                    Verify your email
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    We sent a 6-digit verification
                    code to{" "}
                    <span className="font-medium text-foreground">
                        {email}
                    </span>
                    .
                </p>
            </div>

            <div>
                <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium"
                >
                    Verification code
                </label>

                <input
                    id="otp"
                    value={otp}
                    onChange={(event) =>
                        setOtp(
                            event.target.value
                                .replace(
                                    /\D/g,
                                    "",
                                )
                                .slice(
                                    0,
                                    6,
                                ),
                        )
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    className="w-full rounded-lg border bg-background px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                />
            </div>

            {/* Verification error */}
            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={
                    isLoading ||
                    otp.length !== 6
                }
                className="w-full rounded-lg primary-gradient px-4 py-3 font-medium disabled:opacity-50"
            >
                {isLoading
                    ? "Verifying..."
                    : "Verify Email"}
            </button>

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                </p>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={
                        isResending ||
                        resendCooldown > 0
                    }
                    className="mt-1 text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isResending
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend OTP in ${resendCooldown}s`
                          : "Resend OTP"}
                </button>
            </div>

            {/* Resend error */}
            {resendError && (
                <p className="text-center text-sm text-destructive">
                    {resendError}
                </p>
            )}
        </form>
    );
}