import { useMutation } from "@tanstack/react-query";

export interface ResendEmployerOtpPayload {
    email: string;
}

export interface ResendEmployerOtpResponse {
    success: boolean;
    message: string;
    data?: {
        email: string;
        expiresInMinutes: number;
    };
}

async function resendEmployerOtp(
    payload: ResendEmployerOtpPayload,
): Promise<ResendEmployerOtpResponse> {
    const response = await fetch(
        "/api/auth/employer/resend-otp",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(
                payload,
            ),
        },
    );

    const data =
        (await response.json()) as ResendEmployerOtpResponse;

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Unable to resend verification code.",
        );
    }

    return data;
}

export function useResendEmployerOtp() {
    return useMutation({
        mutationFn: resendEmployerOtp,
    });
}