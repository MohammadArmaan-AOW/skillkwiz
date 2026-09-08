import { NextRequest, NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET!;

const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const updatePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),

        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters")
            .max(128, "New password is too long"),

        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export async function PATCH(request: NextRequest) {
    try {
        const token = request.cookies.get(EMPLOYER_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        let payload: EmployerTokenPayload;

        try {
            payload = jwt.verify(
                token,
                JWT_SECRET,
            ) as unknown as EmployerTokenPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired session.",
                },
                { status: 401 },
            );
        }

        if (!payload.employerId || !payload.email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid employer session.",
                },
                { status: 401 },
            );
        }

        const body = await request.json();

        const validation = updatePasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid password data.",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { currentPassword, newPassword, confirmPassword } =
            validation.data;

        // Dummy implementation for now.
        // Password verification and database update
        // will be implemented later.

        console.log("Dummy password update request:", {
            employerId: payload.employerId,
            email: payload.email,
            currentPasswordProvided: Boolean(currentPassword),
            newPasswordProvided: Boolean(newPassword),
            confirmPasswordProvided: Boolean(confirmPassword),
        });

        return NextResponse.json({
            success: true,
            message: "Password update request received successfully.",
        });
    } catch (error) {
        console.error("Employer password update error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to process password update.",
            },
            { status: 500 },
        );
    }
}
