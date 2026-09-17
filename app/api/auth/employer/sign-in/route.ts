import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

import { createEmployerJwt } from "@/lib/auth/jwt";

const signInSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .toLowerCase(),

    password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = signInSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.flatten().fieldErrors;

            const message =
                Object.values(errors).flat().find(Boolean) ||
                "Please check the entered information.";

            return NextResponse.json(
                {
                    success: false,
                    message,
                    errors,
                },
                { status: 400 },
            );
        }

        const { email, password } = validationResult.data;

        await connectDB();

        const employer = await Employer.findOne({
            email,
        }).select("+passwordHash");

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 },
            );
        }

        if (!employer.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please verify your email before signing in",
                },
                { status: 403 },
            );
        }

        if (!employer.passwordHash) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This account does not use email and password sign in",
                },
                { status: 400 },
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            employer.passwordHash,
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 },
            );
        }

        const token = createEmployerJwt({
            employerId: employer._id.toString(),
            email: employer.email,
            role: "employer",
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "Signed in successfully",
                data: {
                    employerId: employer._id.toString(),
                    email: employer.email,
                    emailVerified: employer.emailVerified,
                },
            },
            { status: 200 },
        );

        response.cookies.set("skillkwiz_employer_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Employer sign in error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while signing in",
            },
            { status: 500 },
        );
    }
}
