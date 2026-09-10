import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

const EMPLOYER_TOKEN_NAME = "skillkwiz_employer_token";

interface EmployerTokenPayload {
    employerId: string;
}

export async function requireEmployer() {
    try {
        await connectDB();

        const cookieStore = await cookies();

        const token = cookieStore.get(EMPLOYER_TOKEN_NAME)?.value;

        if (!token) {
            return null;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("EMPLOYER_JWT_SECRET is not configured.");

            return null;
        }

        const decoded = jwt.verify(token, secret) as EmployerTokenPayload;

        if (!decoded || typeof decoded !== "object" || !decoded.employerId) {
            return null;
        }

        const employer = await Employer.findById(decoded.employerId).select(
            "-passwordHash -emailOtpHash -forgotPasswordToken -resetPasswordToken",
        );

        if (!employer) {
            return null;
        }

        return employer;
    } catch (error) {
        console.error("Employer authentication error:", error);

        return null;
    }
}
