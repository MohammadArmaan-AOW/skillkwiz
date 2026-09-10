import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";
import { createEmployeeJwt } from "@/lib/auth/jwt";

const EMPLOYEE_TOKEN_COOKIE = "skillkwiz_employee_token";

interface ChangeEmployeePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface EmployeeJwtPayload {
    employeeId: string;
    email: string;
    role: "employee";
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        /* ------------------------------------------------------------------ */
        /* Request body                                                        */
        /* ------------------------------------------------------------------ */

        const body =
            (await request.json()) as ChangeEmployeePasswordRequest;

        const currentPassword = body.currentPassword;
        const newPassword = body.newPassword;
        const confirmPassword = body.confirmPassword;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Current password, new password, and confirmation are required.",
                    code: "MISSING_FIELDS",
                },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Validate new password                                               */
        /* ------------------------------------------------------------------ */

        if (newPassword.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be at least 8 characters long.",
                    code: "WEAK_PASSWORD",
                },
                { status: 400 },
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "New passwords do not match.",
                    code: "PASSWORD_MISMATCH",
                },
                { status: 400 },
            );
        }

        if (currentPassword === newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Your new password must be different from your current password.",
                    code: "PASSWORD_UNCHANGED",
                },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Get authenticated employee token                                    */
        /* ------------------------------------------------------------------ */

        const employeeToken =
            request.cookies.get(EMPLOYEE_TOKEN_COOKIE)?.value;

        if (!employeeToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please sign in to change your password.",
                    code: "AUTHENTICATION_REQUIRED",
                },
                { status: 401 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Verify employee JWT                                                 */
        /* ------------------------------------------------------------------ */

        let decoded: EmployeeJwtPayload;

        try {
            decoded = jwt.verify(
                employeeToken,
                process.env.JWT_SECRET!,
            ) as EmployeeJwtPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Your session has expired. Please sign in again.",
                    code: "SESSION_EXPIRED",
                },
                { status: 401 },
            );
        }

        if (
            !decoded.employeeId ||
            decoded.role !== "employee"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid employee session.",
                    code: "INVALID_SESSION",
                },
                { status: 401 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Find employee                                                       */
        /* ------------------------------------------------------------------ */

        const employee = await Employee.findOne({
            employeeId: decoded.employeeId,
        }).select("+passwordHash");

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee account not found.",
                    code: "EMPLOYEE_NOT_FOUND",
                },
                { status: 404 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Account status                                                      */
        /* ------------------------------------------------------------------ */

        if (!employee.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your employee account is inactive.",
                    code: "EMPLOYEE_INACTIVE",
                },
                { status: 403 },
            );
        }

        if (!employee.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please verify your email before changing your password.",
                    code: "EMAIL_NOT_VERIFIED",
                },
                { status: 403 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Verify current password                                             */
        /* ------------------------------------------------------------------ */

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            employee.passwordHash,
        );

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Current password is incorrect.",
                    code: "INVALID_CURRENT_PASSWORD",
                },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Hash and save new password                                          */
        /* ------------------------------------------------------------------ */

        const passwordHash = await bcrypt.hash(newPassword, 12);

        employee.passwordHash = passwordHash;
        employee.mustChangePassword = false;

        await employee.save();

        /* ------------------------------------------------------------------ */
        /* Refresh employee JWT                                                */
        /* ------------------------------------------------------------------ */

        const employeeTokenValue = createEmployeeJwt({
            employeeId: employee.employeeId,
            email: employee.email,
            role: "employee",
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "Password changed successfully.",
                employee: {
                    employeeId: employee.employeeId,
                    fullName: employee.fullName,
                    email: employee.email,
                    hasSignedIn: employee.hasSignedIn,
                    mustChangePassword: employee.mustChangePassword,
                },
            },
            { status: 200 },
        );

        /* ------------------------------------------------------------------ */
        /* Refresh authentication cookie                                       */
        /* ------------------------------------------------------------------ */

        response.cookies.set({
            name: EMPLOYEE_TOKEN_COOKIE,
            value: employeeTokenValue,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error("Employee change password error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Something went wrong while changing the password.",
                code: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
        );
    }
}