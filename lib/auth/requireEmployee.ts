import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db/db";
import Employee from "../db/employeeSchema";

const EMPLOYEE_TOKEN_NAME = "skillkwiz_employee_token";

interface EmployeeTokenPayload {
    employeeId: string;
}

export async function requireEmployee() {
    try {
        await connectDB();

        const cookieStore = await cookies();

        const token = cookieStore.get(EMPLOYEE_TOKEN_NAME)?.value;

        if (!token) {
            return null;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET is not configured.");
            return null;
        }

        const decoded = jwt.verify(
            token,
            secret,
        ) as EmployeeTokenPayload;

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !decoded.employeeId ||
            typeof decoded.employeeId !== "string"
        ) {
            return null;
        }

        let employee;

        /*
         * The employee token may contain either:
         *
         * 1. MongoDB ObjectId
         * 2. Custom employee ID such as SKEMP-DZYUP9
         *
         * Support both so existing sessions don't immediately break.
         */
        if (mongoose.isValidObjectId(decoded.employeeId)) {
            employee = await Employee.findById(
                decoded.employeeId,
            ).select(
                "-passwordHash -emailOtpHash -forgotPasswordToken -resetPasswordToken",
            );
        } else {
            employee = await Employee.findOne({
                employeeId: decoded.employeeId,
            }).select(
                "-passwordHash -emailOtpHash -forgotPasswordToken -resetPasswordToken",
            );
        }

        if (!employee) {
            return null;
        }

        return employee;
    } catch (error) {
        console.error("Employee authentication error:", error);

        return null;
    }
}