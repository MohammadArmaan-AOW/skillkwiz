import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { sendEmail } from "@/lib/email/sendEmail";
import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";
import Employer from "@/lib/db/employerSchema";
import { requireEmployer } from "@/lib/auth/requireEmployer";
import { employeeAccountTemplate } from "@/lib/emailTemplates/employeeAccountTemplate";

interface CreateEmployeeRequest {
    fullName: string;
    email: string;
    phoneNumber?: string;
    department?: string;
    designation?: string;
}

/**
 * Generates a human-readable employee login ID.
 *
 * Example:
 * SKEMP-8F4K2P
 */
function generateEmployeeId(): string {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let randomPart = "";

    for (let i = 0; i < 6; i++) {
        randomPart += characters[crypto.randomInt(0, characters.length)];
    }

    return `SKEMP-${randomPart}`;
}

/**
 * Generates a temporary password.
 *
 * Example:
 * Q7#mK9@pL2$x
 */
function generateTemporaryPassword(length = 12): string {
    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

    let password = "";

    for (let i = 0; i < length; i++) {
        password += characters[crypto.randomInt(0, characters.length)];
    }

    return password;
}

/**
 * POST /api/auth/employee
 *
 * Employer creates an employee login account.
 *
 * One employer credit is consumed for every
 * successfully created employee account.
 */
export async function POST(request: NextRequest) {
    const session = await mongoose.startSession();

    try {
        await connectDB();

        /**
         * Make sure the request is coming from
         * an authenticated employer.
         */
        const employer = await requireEmployer();

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                {
                    status: 401,
                },
            );
        }

        const body = (await request.json()) as CreateEmployeeRequest;

        const fullName = body.fullName?.trim();
        const email = body.email?.trim().toLowerCase();
        const phoneNumber = body.phoneNumber?.trim();
        const department = body.department?.trim();
        const designation = body.designation?.trim();

        /**
         * Basic validation.
         */
        if (!fullName) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee full name is required.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee email is required.",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Basic email validation.
         */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please provide a valid employee email.",
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Make sure employer has a credit available
         * before doing any expensive work.
         */
        if (employer.credits < 1) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You do not have enough credits to create an employee account.",
                    code: "INSUFFICIENT_CREDITS",
                },
                {
                    status: 402,
                },
            );
        }

        /**
         * Make sure this employer has not already
         * created an account for this email.
         */
        const existingEmployee = await Employee.findOne({
            employerId: employer._id,
            email,
        });

        if (existingEmployee) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "An employee account with this email already exists.",
                    code: "EMPLOYEE_ALREADY_EXISTS",
                },
                {
                    status: 409,
                },
            );
        }

        /**
         * Generate credentials.
         */
        let employeeId = generateEmployeeId();

        /**
         * Extremely unlikely collision protection.
         */
        while (
            await Employee.exists({
                employeeId,
            })
        ) {
            employeeId = generateEmployeeId();
        }

        const temporaryPassword = generateTemporaryPassword();

        /**
         * Hash the temporary password.
         */
        const passwordHash = await bcrypt.hash(temporaryPassword, 12);

        /**
         * Start transaction.
         *
         * Employee creation and credit deduction must
         * succeed or fail together.
         */
        session.startTransaction();

        /**
         * IMPORTANT:
         *
         * We do NOT simply decrement credits using the
         * employer object.
         *
         * Instead, we atomically require credits >= 1
         * and decrement by exactly 1.
         */
        const creditResult = await Employer.updateOne(
            {
                _id: employer._id,
                credits: {
                    $gte: 1,
                },
            },
            {
                $inc: {
                    credits: -1,
                },
            },
            {
                session,
            },
        );

        if (creditResult.modifiedCount !== 1) {
            await session.abortTransaction();

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You do not have enough credits to create an employee account.",
                    code: "INSUFFICIENT_CREDITS",
                },
                {
                    status: 402,
                },
            );
        }

        /**
         * Create employee account.
         */
        const employee = new Employee({
            employerId: employer._id,

            employeeId,

            fullName,

            email,

            phoneNumber,

            department,

            designation,

            passwordHash,

            mustChangePassword: true,

            emailVerified: false,

            hasSignedIn: false,

            isActive: true,

            creditConsumed: true,

            creditConsumedAt: new Date(),

            invitationSentAt: undefined,
        });

        await employee.save({
            session,
        });

        /**
         * Commit both:
         *
         * 1. Employee creation
         * 2. Credit deduction
         */
        await session.commitTransaction();

        /**
         * The transaction is complete at this point.
         *
         * Send the invitation email after successful
         * database creation.
         */
        try {
            await sendEmail({
                to: email,
                subject: "Your SkillKwiz Employee Account",
                html: employeeAccountTemplate(
                    fullName,
                    employeeId,
                    temporaryPassword,
                ),
            });

            /**
             * Update invitation timestamp only after
             * email has successfully been sent.
             */
            await Employee.updateOne(
                {
                    _id: employee._id,
                },
                {
                    $set: {
                        invitationSentAt: new Date(),
                    },
                },
            );
        } catch (emailError) {
            console.error("Employee invitation email failed:", emailError);

            /**
             * IMPORTANT:
             *
             * We do NOT restore the credit here automatically.
             *
             * The employee account was already successfully
             * created and the credit was legitimately consumed.
             *
             * We can build a resend-invitation endpoint later.
             */
        }

        return NextResponse.json(
            {
                success: true,
                message: "Employee account created successfully.",
                employee: {
                    id: employee._id,
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
                    invitationSentAt: employee.invitationSentAt,
                    creditConsumed: employee.creditConsumed,
                    creditConsumedAt: employee.creditConsumedAt,
                    createdAt: employee.createdAt,
                },
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        /**
         * Rollback transaction if anything fails
         * before commit.
         */
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Create employee error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create employee account.",
            },
            {
                status: 500,
            },
        );
    } finally {
        await session.endSession();
    }
}
