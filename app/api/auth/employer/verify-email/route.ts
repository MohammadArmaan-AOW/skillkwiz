import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

import { resend, EMAIL_FROM } from "@/lib/email/resend";
import { createEmployerJwt } from "@/lib/auth/jwt";
import { employerWelcomeTemplate } from "@/lib/emailTemplates/employerWelcome";
import { sendEmail } from "@/lib/email/sendEmail";

const verifyEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .toLowerCase(),

    otp: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = verifyEmailSchema.safeParse(body);

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

        const { email, otp } = validationResult.data;

        await connectDB();

        const employer = await Employer.findOne({
            email,
        }).select("+emailOtpHash +emailOtpExpiresAt");

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No account found with this email address",
                },
                { status: 404 },
            );
        }

        if (employer.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email is already verified",
                },
                { status: 409 },
            );
        }

        if (!employer.emailOtpHash || !employer.emailOtpExpiresAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code is invalid or unavailable",
                },
                { status: 400 },
            );
        }

        if (employer.emailOtpExpiresAt.getTime() < Date.now()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code has expired",
                },
                { status: 400 },
            );
        }

        const isOtpValid = await bcrypt.compare(otp, employer.emailOtpHash);

        if (!isOtpValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid verification code",
                },
                { status: 400 },
            );
        }

        // Mark email as verified
        employer.emailVerified = true;

        // Remove OTP after successful verification
        employer.emailOtpHash = undefined;
        employer.emailOtpExpiresAt = undefined;

        await employer.save();

        // Create JWT
        const token = createEmployerJwt({
            employerId: employer._id.toString(),
            email: employer.email,
            role: "employer",
        });

        // Welcome/profile link
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const profileUrl = `${appUrl}/services/employer/profile`;

        // Send welcome email
        const emailHtml = employerWelcomeTemplate({
            fullName: employer.fullName,
            profileUrl,
        });

        // const { error: emailError } = await resend.emails.send({
        //     from: EMAIL_FROM,
        //     to: employer.email,
        //     subject: "Welcome to SkillKwiz",
        //     html: emailHtml,
        // });

        // if (emailError) {
        //     console.error("Welcome email error:", emailError);
        // }

        try {
            await sendEmail({
                to: email,
                subject: "Welcome to SkillKwiz:",
                html: emailHtml,
            });
        } catch (emailError) {
            console.error("Gmail email error:", emailError);
        }

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: "Email verified successfully",
                data: {
                    employerId: employer._id.toString(),
                    email: employer.email,
                    emailVerified: employer.emailVerified,
                },
            },
            { status: 200 },
        );

        // Store JWT in HttpOnly cookie
        response.cookies.set("skillkwiz_employer_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Employer email verification error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while verifying your email",
            },
            { status: 500 },
        );
    }
}
