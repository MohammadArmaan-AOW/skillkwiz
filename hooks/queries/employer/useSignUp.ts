import { useMutation } from "@tanstack/react-query";

interface SignUpPayload {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface SignUpResponse {
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

async function signUpEmployer(payload: SignUpPayload): Promise<SignUpResponse> {
    const response = await fetch("/api/auth/employer/sign-up", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const error: ApiError = {
            message: data.message || "Unable to create account",
            errors: data.errors,
        };

        throw error;
    }

    return data;
}

export function useSignUp() {
    return useMutation<SignUpResponse, ApiError, SignUpPayload>({
        mutationFn: signUpEmployer,
    });
}
