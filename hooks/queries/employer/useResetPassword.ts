import { useMutation } from "@tanstack/react-query";

interface ResetPasswordPayload {
    token: string;
    password: string;
    confirmPassword: string;
}

interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

interface ApiError {
    message: string;
    errors?: Record<string, string[] | undefined>;
}

async function resetEmployerPassword(
    payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
    const response = await fetch("/api/auth/employer/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const error: ApiError = {
            message: data.message || "Unable to reset password",
            errors: data.errors,
        };

        throw error;
    }

    return data;
}

export function useResetPassword() {
    return useMutation<ResetPasswordResponse, ApiError, ResetPasswordPayload>({
        mutationFn: resetEmployerPassword,
    });
}
