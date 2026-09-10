import { NextResponse } from "next/server";

const EMPLOYEE_TOKEN_COOKIE = "skillkwiz_employee_token";

export async function POST() {
    try {
        /**
         * -------------------------------------------------------------
         * Create response
         * -------------------------------------------------------------
         */

        const response = NextResponse.json(
            {
                success: true,
                message: "Employee logged out successfully.",
            },
            {
                status: 200,
            },
        );

        /**
         * -------------------------------------------------------------
         * Clear employee authentication cookie
         * -------------------------------------------------------------
         *
         * The cookie must use the same:
         *
         * - name
         * - path
         *
         * as the cookie created during login.
         */

        response.cookies.set(EMPLOYEE_TOKEN_COOKIE, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error("Employee logout error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to log out. Please try again.",
                code: "LOGOUT_FAILED",
            },
            {
                status: 500,
            },
        );
    }
}
