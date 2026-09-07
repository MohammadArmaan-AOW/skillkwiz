import { useState } from "react";

interface EmailVerificationFormProps {
    email: string;
    isLoading: boolean;
    onSubmit: (otp: string) => void;
}

export default function EmailVerificationForm({
    email,
    isLoading,
    onSubmit,
}: EmailVerificationFormProps) {
    const [otp, setOtp] = useState("");

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
                    We sent a 6-digit verification code
                    to{" "}
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
                                .replace(/\D/g, "")
                                .slice(0, 6),
                        )
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full rounded-lg border bg-background px-4 py-3 text-center text-xl tracking-[0.5em] outline-none"
                    required
                />
            </div>

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
        </form>
    );
}