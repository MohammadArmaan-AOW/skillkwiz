import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

const JWT_SECRET = process.env.JWT_SECRET!;

const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(EMPLOYER_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    employer: null,
                },
                { status: 401 },
            );
        }

        let payload: EmployerTokenPayload;

        try {
            payload = jwt.verify(token, JWT_SECRET) as EmployerTokenPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    employer: null,
                },
                { status: 401 },
            );
        }

        if (!payload.employerId || !payload.email) {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    employer: null,
                },
                { status: 401 },
            );
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

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    employer: null,
                },
                { status: 401 },
            );
        }

        return NextResponse.json({
            success: true,
            authenticated: true,
            employer: {
                id: employer._id.toString(),
                fullName: employer.fullName,
                email: employer.email,
                emailVerified: employer.emailVerified,
                googleId: employer.googleId,
                authProvider: employer.authProvider,
                profilePhoto: employer.profilePhoto,
                phoneNumber: employer.phoneNumber,
                companyName: employer.companyName,
                companyAddress: employer.companyAddress,
                department: employer.department,
                authorizedToPay: employer.authorizedToPay,
                authorizationDetails: employer.authorizationDetails,
                createdAt: employer.createdAt,
                updatedAt: employer.updatedAt,
            },
        });
    } catch (error) {
        console.error("Get current employer error:", error);

        return NextResponse.json(
            {
                success: false,
                authenticated: false,
                employer: null,
                message: "Failed to fetch employer session.",
            },
            { status: 500 },
        );
    }
}
