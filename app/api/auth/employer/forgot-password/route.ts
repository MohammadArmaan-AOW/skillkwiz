import { NextResponse } from "next/server";

import { randomBytes } from "crypto";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

import { resend, EMAIL_FROM } from "@/lib/email/resend";

import { employerForgotPasswordTemplate } from "@/lib/emailTemplates/employerForgotPassword";
import { hashToken } from "@/lib/auth/jwt";
import { sendEmail } from "@/lib/email/sendEmail";

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .toLowerCase(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = forgotPasswordSchema.safeParse(body);

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

        const { email } = validationResult.data;

        await connectDB();

        const employer = await Employer.findOne({
            email,
        });

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No account found with this email address",
                },
                { status: 404 },
            );
        }

        const resetToken = randomBytes(32).toString("hex");

        const resetTokenHash = hashToken(resetToken);

        const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        employer.forgotPasswordToken = resetTokenHash;

        employer.forgotPasswordExpiresAt = resetTokenExpiresAt;

        await employer.save();

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        const emailHtml = employerForgotPasswordTemplate({
            fullName: employer.fullName,
            resetUrl,
        });

        // const { error: emailError } = await resend.emails.send({
        //     from: EMAIL_FROM,
        //     to: employer.email,
        //     subject: "Reset your SkillKwiz password",
        //     html: emailHtml,
        // });

        // if (emailError) {
        //     console.error("Forgot password email error:", emailError);

        try {
            await sendEmail({
                to: employer.email,
                subject: "Reset your SkillKwiz password",
                html: emailHtml,
            });
        } catch (emailError) {
            console.error("Forgot password email error:", emailError);

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to send password reset email",
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Password reset email sent successfully",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Forgot password error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while processing your request",
            },
            { status: 500 },
        );
    }
}
