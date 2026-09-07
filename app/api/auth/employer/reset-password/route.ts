import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";
import { hashToken } from "@/lib/auth/jwt";

const resetPasswordSchema = z
    .object({
        token: z
            .string()
            .min(1, "Reset token is required"),

        password: z
            .string()
            .min(
                8,
                "Password must be at least 8 characters",
            )
            .max(100, "Password is too long"),

        confirmPassword: z.string(),
    })
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        },
    );

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult =
            resetPasswordSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors:
                        validationResult.error.flatten()
                            .fieldErrors,
                },
                { status: 400 },
            );
        }

        const { token, password } =
            validationResult.data;

        const tokenHash = hashToken(token);

        await connectDB();

        const employer = await Employer.findOne({
            forgotPasswordToken: tokenHash,
        }).select(
            "+forgotPasswordToken +forgotPasswordExpiresAt",
        );

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired password reset link",
                },
                { status: 400 },
            );
        }

        if (
            !employer.forgotPasswordExpiresAt ||
            employer.forgotPasswordExpiresAt.getTime() <
                Date.now()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password reset link has expired",
                },
                { status: 400 },
            );
        }

        const passwordHash =
            await bcrypt.hash(password, 12);

        employer.passwordHash = passwordHash;

        employer.forgotPasswordToken =
            undefined;

        employer.forgotPasswordExpiresAt =
            undefined;

        await employer.save();

        return NextResponse.json(
            {
                success: true,
                message:
                    "Password reset successfully",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(
            "Reset password error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Something went wrong while resetting your password",
            },
            { status: 500 },
        );
    }
}