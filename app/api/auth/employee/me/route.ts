
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";

const EMPLOYEE_TOKEN_COOKIE = "skillkwiz_employee_token";

interface EmployeeJwtPayload {
  employeeId: string;
  email: string;
  role: "employee";
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // -------------------------------------------------------------
    // Get employee token
    // -------------------------------------------------------------

    const employeeToken =
      request.cookies.get(EMPLOYEE_TOKEN_COOKIE)?.value;

    console.log(
      "[EMPLOYEE ME] Cookie exists:",
      Boolean(employeeToken),
    );

    console.log(
      "[EMPLOYEE ME] Cookie names:",
      request.cookies.getAll().map((cookie) => cookie.name),
    );

    if (!employeeToken) {
      console.log(
        "[EMPLOYEE ME] ERROR: skillkwiz_employee_token is missing",
      );

      return NextResponse.json(
        {
          success: false,
          message: "Employee authentication is required.",
          code: "AUTHENTICATION_REQUIRED",
        },
        { status: 401 },
      );
    }

    // -------------------------------------------------------------
    // Verify JWT
    // -------------------------------------------------------------

    const jwtSecret = process.env.JWT_SECRET;

    console.log(
      "[EMPLOYEE ME] JWT secret exists:",
      Boolean(jwtSecret),
    );

    if (!jwtSecret) {
      console.error(
        "[EMPLOYEE ME] ERROR: EMPLOYEE_JWT_SECRET is missing",
      );

      return NextResponse.json(
        {
          success: false,
          message: "Employee authentication configuration is missing.",
          code: "AUTH_CONFIGURATION_ERROR",
        },
        { status: 500 },
      );
    }

    let decoded: EmployeeJwtPayload;

    try {
      decoded = jwt.verify(
        employeeToken,
        jwtSecret,
      ) as EmployeeJwtPayload;

      console.log("[EMPLOYEE ME] JWT decoded:", decoded);
    } catch (error) {
      console.error(
        "[EMPLOYEE ME] JWT verification failed:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Your employee session has expired. Please sign in again.",
          code: "SESSION_EXPIRED",
        },
        { status: 401 },
      );
    }

    // -------------------------------------------------------------
    // Validate payload
    // -------------------------------------------------------------

    if (
      !decoded.employeeId ||
      !decoded.email ||
      decoded.role !== "employee"
    ) {
      console.error(
        "[EMPLOYEE ME] Invalid JWT payload:",
        decoded,
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid employee authentication session.",
          code: "INVALID_SESSION",
        },
        { status: 401 },
      );
    }

    // -------------------------------------------------------------
    // Find employee
    // -------------------------------------------------------------

    const employee = await Employee.findOne({
      employeeId: decoded.employeeId,
    }).select(
      "-passwordHash -otp -otpExpiresAt -resetPasswordOtp -resetPasswordOtpExpiresAt",
    );

    console.log(
      "[EMPLOYEE ME] Employee found:",
      Boolean(employee),
    );

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

    // -------------------------------------------------------------
    // Check account status
    // -------------------------------------------------------------

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

    // -------------------------------------------------------------
    // Return employee
    // -------------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Employee profile retrieved successfully.",
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          department: employee.department,
          designation: employee.designation,
          emailVerified: employee.emailVerified,
          hasSignedIn: employee.hasSignedIn,
          mustChangePassword: employee.mustChangePassword,
          isActive: employee.isActive,
          firstSignedInAt: employee.firstSignedInAt,
          lastSignedInAt: employee.lastSignedInAt,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[EMPLOYEE ME] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while loading your employee profile.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
