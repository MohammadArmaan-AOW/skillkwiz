import { useMutation } from "@tanstack/react-query";

interface VerifyEmailPayload {
    email: string;
    otp: string;
}

interface VerifyEmailResponse {
    success: boolean;
    message: string;
    data?: {
        employerId: string;
        email: string;
        emailVerified: boolean;
    };
}

interface ApiError {
    message: string;
    errors?: Record<string, string[] | undefined>;
}

async function verifyEmployerEmail(
    payload: VerifyEmailPayload,
): Promise<VerifyEmailResponse> {
    const response = await fetch("/api/auth/employer/verify-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const error: ApiError = {
            message: data.message || "Unable to verify email",
            errors: data.errors,
        };

        throw error;
    }

    return data;
}

export function useVerifyEmail() {
    return useMutation<VerifyEmailResponse, ApiError, VerifyEmailPayload>({
        mutationFn: verifyEmployerEmail,
    });
}
