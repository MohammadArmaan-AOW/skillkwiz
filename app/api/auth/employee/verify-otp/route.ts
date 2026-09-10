import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";

const EMPLOYEE_TOKEN_COOKIE = "skillkwiz_employee_token";

interface VerifyEmployeeOtpRequest {
    employeeId: string;
    otp: string;
}

interface EmployeeJwtPayload {
    employeeId: string;
    email: string;
    role: "employee";
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = (await request.json()) as VerifyEmployeeOtpRequest;

        const employeeId = body.employeeId?.trim().toUpperCase();
        const otp = body.otp?.trim();

        /**
         * -----------------------------
         * VALIDATION
         * -----------------------------
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

        if (!otp) {
            return NextResponse.json(
                {
                    success: false,
                    message: "OTP is required.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please enter a valid 6-digit OTP.",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * -----------------------------
         * FETCH EMPLOYEE
         * -----------------------------
         *
         * OTP fields are select:false
         * in the schema, so explicitly
         * include them.
         */

        const employee = await Employee.findOne({
            employeeId,
        }).select("+emailOtpHash +emailOtpExpiresAt");

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid verification request.",
                },
                {
                    status: 404,
                },
            );
        }

        /**
         * -----------------------------
         * ACCOUNT STATUS
         * -----------------------------
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
         * -----------------------------
         * OTP EXISTENCE CHECK
         * -----------------------------
         */

        if (!employee.emailOtpHash || !employee.emailOtpExpiresAt) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No active verification code was found. Please request a new OTP.",
                    code: "OTP_NOT_FOUND",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * -----------------------------
         * OTP EXPIRY CHECK
         * -----------------------------
         */

        if (new Date() > employee.emailOtpExpiresAt) {
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
                        "This verification code has expired. Please request a new OTP.",
                    code: "OTP_EXPIRED",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * -----------------------------
         * VERIFY OTP
         * -----------------------------
         */

        const otpValid = await bcrypt.compare(otp, employee.emailOtpHash);

        if (!otpValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid verification code.",
                    code: "INVALID_OTP",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * -----------------------------
         * EMAIL VERIFICATION
         * -----------------------------
         *
         * OTP verification permanently
         * verifies the employee email.
         */

        employee.emailVerified = true;

        /**
         * -----------------------------
         * FIRST SIGN-IN
         * -----------------------------
         *
         * A successful OTP verification
         * means the employee has completed
         * their sign-in verification.
         *
         * firstSignedInAt is only set once.
         */

        const signedInAt = new Date();

        if (!employee.hasSignedIn) {
            employee.hasSignedIn = true;
            employee.firstSignedInAt = signedInAt;
        }

        employee.lastSignedInAt = signedInAt;

        /**
         * -----------------------------
         * OTP ONE-TIME USE
         * -----------------------------
         */

        employee.emailOtpHash = undefined;
        employee.emailOtpExpiresAt = undefined;

        /**
         * -----------------------------
         * SAVE EMPLOYEE
         * -----------------------------
         */

        await employee.save();

        /**
         * -----------------------------
         * CREATE EMPLOYEE SESSION
         * -----------------------------
         *
         * The employee has successfully
         * authenticated with:
         *
         * 1. Employee ID
         * 2. Password
         * 3. Email OTP
         *
         * Therefore create the authenticated
         * employee JWT session.
         */

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured.");

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Employee authentication is not configured correctly.",
                    code: "AUTH_CONFIGURATION_ERROR",
                },
                {
                    status: 500,
                },
            );
        }

        const payload: EmployeeJwtPayload = {
            employeeId: employee.employeeId,
            email: employee.email,
            role: "employee",
        };

        const token = jwt.sign(payload, jwtSecret, {
            expiresIn: "7d",
        });

        /**
         * -----------------------------
         * RESPONSE
         * -----------------------------
         */

        const response = NextResponse.json(
            {
                success: true,
                message: employee.mustChangePassword
                    ? "Email verified successfully. Please change your temporary password to continue."
                    : "Email verified successfully.",
                requiresPasswordChange: employee.mustChangePassword,
                requiresSessionCreation: false,
                emailVerified: true,
                employee: {
                    employeeId: employee.employeeId,
                    fullName: employee.fullName,
                    email: employee.email,
                    hasSignedIn: employee.hasSignedIn,
                    firstSignedInAt: employee.firstSignedInAt,
                    mustChangePassword: employee.mustChangePassword,
                },
            },
            {
                status: 200,
            },
        );

        /**
         * -----------------------------
         * SET EMPLOYEE AUTH COOKIE
         * -----------------------------
         */

        response.cookies.set(EMPLOYEE_TOKEN_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error("Employee OTP verification error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to verify the OTP. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}
