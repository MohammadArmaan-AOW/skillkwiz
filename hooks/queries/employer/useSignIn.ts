import { useMutation } from "@tanstack/react-query";

interface SignInPayload {
    email: string;
    password: string;
}

interface SignInResponse {
    success: boolean;
    message: string;
    data?: {
        employerId: string;
        fullName: string;
        email: string;
        emailVerified: boolean;
    };
}

interface ApiError {
    message: string;
    errors?: Record<string, string[] | undefined>;
}

async function signInEmployer(payload: SignInPayload): Promise<SignInResponse> {
    const response = await fetch("/api/auth/employer/sign-in", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const error: ApiError = {
            message: data.message || "Unable to sign in",
            errors: data.errors,
        };

        throw error;
    }

    return data;
}

export function useSignIn() {
    return useMutation<SignInResponse, ApiError, SignInPayload>({
        mutationFn: signInEmployer,
    });
}
