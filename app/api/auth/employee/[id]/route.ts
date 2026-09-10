import { NextRequest, NextResponse } from "next/server";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    _request: NextRequest,
    context: RouteContext,
) {
    try {
        const employer = await requireEmployer();

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                { status: 401 },
            );
        }

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee ID is required.",
                },
                { status: 400 },
            );
        }

        await connectDB();

        const employee = await Employee.findOne({
            employeeId: id,
            employerId: employer._id,
        })
            .select(
                [
                    "_id",
                    "employeeId",
                    "fullName",
                    "email",
                    "phoneNumber",
                    "department",
                    "designation",
                    "emailVerified",
                    "hasSignedIn",
                    "mustChangePassword",
                    "isActive",
                    "firstSignedInAt",
                    "lastSignedInAt",
                    "invitationSentAt",
                    "creditConsumed",
                    "creditConsumedAt",
                    "createdAt",
                    "updatedAt",
                ].join(" "),
            )
            .lean();

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Candidate not found.",
                },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                employee,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Fetch employee details error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch candidate details.",
            },
            { status: 500 },
        );
    }
}