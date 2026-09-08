import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

import { resend, EMAIL_FROM } from "@/lib/email/resend";

import { employerVerificationOtpTemplate } from "@/lib/emailTemplates/employerVerificationOtp";
import { sendEmail } from "@/lib/email/sendEmail";

const signupSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(2, "Full name must be at least 2 characters")
            .max(100, "Full name is too long"),

        email: z
            .string()
            .trim()
            .email("Please provide a valid email address")
            .toLowerCase(),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password is too long"),

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = signupSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { fullName, email, password } = validationResult.data;

        await connectDB();

        const existingEmployer = await Employer.findOne({ email });

        if (existingEmployer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "An account with this email already exists",
                },
                { status: 409 },
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Generate 6-digit OTP
        const emailOtp = randomInt(100000, 1000000).toString();

        // Hash OTP before storing
        const emailOtpHash = await bcrypt.hash(emailOtp, 10);

        // OTP expires after 10 minutes
        const emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Create employer
        const employer = await Employer.create({
            fullName,
            email,
            passwordHash,

            emailVerified: false,

            authProvider: "email",

            emailOtpHash,
            emailOtpExpiresAt,
        });

        // Create email HTML
        const emailHtml = employerVerificationOtpTemplate({
            fullName,
            otp: emailOtp,
        });

        // const { error: emailError } = await resend.emails.send({
        //     from: EMAIL_FROM,
        //     to: email,
        //     subject: "Verify your SkillKwiz account",
        //     html: emailHtml,
        // });

        // if (emailError) {
        //     console.error("Resend email error:", emailError);
        // }

        try {
            await sendEmail({
                to: email,
                subject: "Verify your SkillKwiz account",
                html: emailHtml,
            });
        } catch (emailError) {
            console.error("Gmail email error:", emailError);

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Account created, but we could not send the verification email. Please try again.",
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    "Account created successfully. Please check your email for the verification code.",
                data: {
                    employerId: employer._id.toString(),

                    email: employer.email,

                    emailVerified: employer.emailVerified,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Employer signup error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while creating the account",
            },
            { status: 500 },
        );
    }
}
