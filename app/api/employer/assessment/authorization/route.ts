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
                    message: "Unauthorized.",
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
                    message: "Invalid or expired authentication token.",
                },
                { status: 401 },
            );
        }

        if (!payload.employerId || !payload.email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid employer authentication.",
                },
                { status: 401 },
            );
        }

        await connectDB();

        const employer = await Employer.findById(payload.employerId)
            .select(
                "credits phoneNumber department companyName companyAddress",
            )
            .lean();

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employer not found.",
                },
                { status: 404 },
            );
        }

        const credits = Math.max(0, employer.credits ?? 0);

        const hasPhoneNumber =
            typeof employer.phoneNumber === "string" &&
            employer.phoneNumber.trim().length > 0;

        const hasDepartment =
            typeof employer.department === "string" &&
            employer.department.trim().length > 0;

        const hasCompanyName =
            typeof employer.companyName === "string" &&
            employer.companyName.trim().length > 0;

        const hasCompanyAddress =
            typeof employer.companyAddress === "string" &&
            employer.companyAddress.trim().length > 0;

        const profileComplete =
            hasPhoneNumber &&
            hasDepartment &&
            hasCompanyName &&
            hasCompanyAddress;

        const hasCredits = credits > 0;

        const authorized = hasCredits && profileComplete;

        return NextResponse.json({
            success: true,
            authorized,
            credits,
            profileComplete,
            hasCredits,
            missingDetails: {
                phoneNumber: !hasPhoneNumber,
                department: !hasDepartment,
                companyName: !hasCompanyName,
                companyAddress: !hasCompanyAddress,
            },
        });
    } catch (error) {
        console.error("Assessment authorization error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to check assessment authorization.",
            },
            { status: 500 },
        );
    }
}