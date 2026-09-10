import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";
import { sendEmail } from "@/lib/email/sendEmail";
import { employeeLoginOtpTemplate } from "@/lib/emailTemplates/employeeLoginOtpTemplate";

interface EmployeeLoginRequest {
    employeeId: string;
    password: string;
}

/**
 * Generates a secure 6-digit OTP.
 */
function generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
}

/**
 * POST /api/auth/employee/login
 *
 * Employee signs in using:
 *
 * employeeId + password
 *
 * If credentials are valid:
 *
 * 1. Generate OTP
 * 2. Hash OTP
 * 3. Store OTP + expiry
 * 4. Send OTP to employee email
 *
 * Full authentication is created only after
 * successful OTP verification.
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = (await request.json()) as EmployeeLoginRequest;

        const employeeId = body.employeeId?.trim().toUpperCase();

        const password = body.password;

        /**
         * Validate request.
         */
        if (!employeeId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee ID is required.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password is required.",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Fetch employee.
         *
         * passwordHash and OTP fields are explicitly
         * selected because the schema hides them
         * using select: false.
         */
        const employee = await Employee.findOne({
            employeeId,
        }).select("+passwordHash +emailOtpHash +emailOtpExpiresAt");

        /**
         * Do not reveal whether the employee ID
         * exists.
         */
        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid employee ID or password.",
                },
                {
                    status: 401,
                },
            );
        }

        /**
         * Check account status.
         */
        if (!employee.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Your employee account is inactive. Please contact your employer.",
                },
                {
                    status: 403,
                },
            );
        }

        /**
         * Verify password.
         */
        const passwordValid = await bcrypt.compare(
            password,
            employee.passwordHash,
        );

        if (!passwordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid employee ID or password.",
                },
                {
                    status: 401,
                },
            );
        }

        /**
         * Generate OTP.
         */
        const otp = generateOtp();

        /**
         * Hash OTP before storing it.
         */
        const otpHash = await bcrypt.hash(otp, 10);

        /**
         * OTP expires after 10 minutes.
         */
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        /**
         * Store OTP hash and expiry.
         *
         * If an old OTP exists, it gets replaced.
         */
        await Employee.updateOne(
            {
                _id: employee._id,
            },
            {
                $set: {
                    emailOtpHash: otpHash,
                    emailOtpExpiresAt: otpExpiresAt,
                },
            },
        );

        /**
         * Send OTP to registered employee email.
         */
        try {
            await sendEmail({
                to: employee.email,
                subject: "SkillKwiz Login Verification Code",
                html: employeeLoginOtpTemplate(employee.fullName, otp),
            });
        } catch (emailError) {
            console.error("Employee OTP email error:", emailError);

            /**
             * Remove OTP if email delivery failed.
             * This prevents a stored OTP that the employee
             * never received from remaining valid.
             */
            await Employee.updateOne(
                {
                    _id: employee._id,
                },
                {
                    $unset: {
                        emailOtpHash: 1,
                        emailOtpExpiresAt: 1,
                    },
                },
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unable to send verification code. Please try again.",
                },
                {
                    status: 500,
                },
            );
        }

        /**
         * OTP has been sent successfully.
         *
         * No employee session is created yet.
         */
        return NextResponse.json(
            {
                success: true,
                message: "Verification code sent to your registered email.",
                requiresOtpVerification: true,
                employee: {
                    employeeId: employee.employeeId,
                    email: employee.email,
                    emailVerified: employee.emailVerified,
                    mustChangePassword: employee.mustChangePassword,
                },
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("Employee login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to sign in. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}
