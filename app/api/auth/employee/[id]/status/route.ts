import { NextRequest, NextResponse } from "next/server";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

        const body = await request.json();

        const { isActive } = body;

        if (typeof isActive !== "boolean") {
            return NextResponse.json(
                {
                    success: false,
                    message: "isActive must be a boolean.",
                },
                { status: 400 },
            );
        }

        await connectDB();

        const employee = await Employee.findOne({
            employeeId: id,
            employerId: employer._id,
        });

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Candidate not found.",
                },
                { status: 404 },
            );
        }

        employee.isActive = isActive;

        await employee.save();

        return NextResponse.json(
            {
                success: true,
                message: isActive
                    ? "Candidate account activated successfully."
                    : "Candidate account deactivated successfully.",
                employee: {
                    employeeId: employee.employeeId,
                    fullName: employee.fullName,
                    email: employee.email,
                    isActive: employee.isActive,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Update employee status error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update candidate status.",
            },
            { status: 500 },
        );
    }
}
