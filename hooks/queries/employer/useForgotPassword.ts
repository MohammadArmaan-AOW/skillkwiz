import { useMutation } from "@tanstack/react-query";

interface ForgotPasswordPayload {
    email: string;
}

interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

interface ApiError {
    message: string;
    errors?: Record<string, string[] | undefined>;
}

async function forgotEmployerPassword(
    payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
    const response = await fetch("/api/auth/employer/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const error: ApiError = {
            message: data.message || "Unable to process password reset request",
            errors: data.errors,
        };

        throw error;
    }

    return data;
}

export function useForgotPassword() {
    return useMutation<ForgotPasswordResponse, ApiError, ForgotPasswordPayload>(
        {
            mutationFn: forgotEmployerPassword,
        },
    );
}
