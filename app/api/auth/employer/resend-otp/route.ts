import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

import { sendEmail } from "@/lib/email/sendEmail";

import { employerVerificationOtpTemplate } from "@/lib/emailTemplates/employerVerificationOtp";

const OTP_EXPIRY_MINUTES = 10;

const resendOtpSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .toLowerCase(),
});

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();

        const validationResult = resendOtpSchema.safeParse(body);

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

        /**
         * -----------------------------
         * FIND EMPLOYER
         * -----------------------------
         */

        const employer = await Employer.findOne({
            email,
        });

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No account was found with this email address.",
                },
                {
                    status: 404,
                },
            );
        }

        /**
         * -----------------------------
         * ALREADY VERIFIED
         * -----------------------------
         */

        if (employer.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This email address is already verified.",
                    code: "EMAIL_ALREADY_VERIFIED",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * -----------------------------
         * GENERATE NEW OTP
         * -----------------------------
         */

        const emailOtp = randomInt(100000, 1000000).toString();

        /**
         * -----------------------------
         * HASH OTP
         * -----------------------------
         */

        const emailOtpHash = await bcrypt.hash(emailOtp, 10);

        /**
         * -----------------------------
         * OTP EXPIRY
         * -----------------------------
         */

        const emailOtpExpiresAt = new Date(
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
        );

        /**
         * -----------------------------
         * SAVE NEW OTP
         * -----------------------------
         */

        employer.emailOtpHash = emailOtpHash;

        employer.emailOtpExpiresAt = emailOtpExpiresAt;

        await employer.save();

        /**
         * -----------------------------
         * CREATE EMAIL
         * -----------------------------
         */

        const emailHtml = employerVerificationOtpTemplate({
            fullName: employer.fullName,
            otp: emailOtp,
        });

        /**
         * -----------------------------
         * SEND EMAIL
         * -----------------------------
         */

        try {
            await sendEmail({
                to: employer.email,
                subject: "Verify your SkillKwiz account",
                html: emailHtml,
            });
        } catch (emailError) {
            console.error("Employer resend OTP email error:", emailError);

            /*
             * Remove the OTP if the email
             * could not be delivered.
             */
            employer.emailOtpHash = undefined;

            employer.emailOtpExpiresAt = undefined;

            await employer.save();

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "We could not send the verification email. Please try again.",
                    code: "OTP_EMAIL_FAILED",
                },
                {
                    status: 500,
                },
            );
        }

        /**
         * -----------------------------
         * RESPONSE
         * -----------------------------
         */

        return NextResponse.json(
            {
                success: true,
                message:
                    "A new verification code has been sent to your email address.",
                data: {
                    email: employer.email,
                    expiresInMinutes: OTP_EXPIRY_MINUTES,
                },
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("Employer resend OTP error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to resend the verification code. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}
