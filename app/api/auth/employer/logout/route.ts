import { NextResponse } from "next/server";

const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully.",
        });

        response.cookies.set({
            name: EMPLOYER_TOKEN_COOKIE,
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(0),
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Employer logout error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to logout.",
            },
            { status: 500 },
        );
    }
}
