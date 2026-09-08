import { NextRequest, NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import { z } from "zod";

import { connectDB } from "@/lib/db/db";

import Employer from "@/lib/db/employerSchema";

const JWT_SECRET = process.env.JWT_SECRET!;

const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const updateProfileSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name is too long"),

    profilePhoto: z
        .string()
        .trim()
        .url("Please provide a valid profile photo URL")
        .nullable()
        .optional(),

    phoneNumber: z
        .string()
        .trim()
        .max(30, "Phone number is too long")
        .optional(),

    companyName: z
        .string()
        .trim()
        .max(150, "Company name is too long")
        .optional(),

    companyAddress: z
        .string()
        .trim()
        .max(500, "Company address is too long")
        .optional(),

    department: z.string().trim().max(100, "Department is too long").optional(),
});

function serializeEmployer(employer: any) {
    return {
        id: employer._id.toString(),

        fullName: employer.fullName,

        email: employer.email,

        emailVerified: employer.emailVerified,

        googleId: employer.googleId ?? null,

        authProvider: employer.authProvider,

        profilePhoto: employer.profilePhoto ?? null,

        phoneNumber: employer.phoneNumber ?? "",

        companyName: employer.companyName ?? "",

        companyAddress: employer.companyAddress ?? "",

        department: employer.department ?? "",

        authorizedToPay: employer.authorizedToPay,

        authorizationDetails: employer.authorizationDetails ?? null,

        createdAt: employer.createdAt,

        updatedAt: employer.updatedAt,
    };
}

async function getAuthenticatedEmployer(request: NextRequest) {
    const token = request.cookies.get(EMPLOYER_TOKEN_COOKIE)?.value;

    if (!token) {
        return null;
    }

    let payload: EmployerTokenPayload;

    try {
        payload = jwt.verify(
            token,
            JWT_SECRET,
        ) as unknown as EmployerTokenPayload;
    } catch {
        return null;
    }

    if (!payload.employerId || !payload.email) {
        return null;
    }

    await connectDB();

    const employer = await Employer.findById(payload.employerId).select(
        "-passwordHash " +
            "-emailOtpHash " +
            "-emailOtpExpiresAt " +
            "-forgotPasswordToken " +
            "-forgotPasswordExpiresAt " +
            "-resetPasswordToken " +
            "-resetPasswordExpiresAt",
    );

    return employer;
}

/**
 * GET
 *
 * Fetch the authenticated employer's profile.
 */
export async function GET(request: NextRequest) {
    try {
        const employer = await getAuthenticatedEmployer(request);

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        return NextResponse.json({
            success: true,
            employer: serializeEmployer(employer),
        });
    } catch (error) {
        console.error("Get employer profile error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch employer profile.",
            },
            {
                status: 500,
            },
        );
    }
}

/**
 * PATCH
 *
 * Update the authenticated employer's editable profile data.
 */
export async function PATCH(request: NextRequest) {
    try {
        const employer = await getAuthenticatedEmployer(request);

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        const body = await request.json();

        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid profile data.",
                    errors: validation.error.flatten().fieldErrors,
                },
                {
                    status: 400,
                },
            );
        }

        const {
            fullName,
            profilePhoto,
            phoneNumber,
            companyName,
            companyAddress,
            department,
        } = validation.data;

        employer.fullName = fullName;

        if (profilePhoto !== undefined) {
            employer.profilePhoto = profilePhoto;
        }

        if (phoneNumber !== undefined) {
            employer.phoneNumber = phoneNumber;
        }

        if (companyName !== undefined) {
            employer.companyName = companyName;
        }

        if (companyAddress !== undefined) {
            employer.companyAddress = companyAddress;
        }

        if (department !== undefined) {
            employer.department = department;
        }

        await employer.save();

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully.",
            employer: serializeEmployer(employer),
        });
    } catch (error) {
        console.error("Update employer profile error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update employer profile.",
            },
            {
                status: 500,
            },
        );
    }
}
