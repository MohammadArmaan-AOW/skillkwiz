import { NextRequest, NextResponse } from "next/server";

const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";
const EMPLOYEE_TOKEN_COOKIE = "skillkwiz_employee_token";

const EMPLOYEE_ROUTES = ["/services/employee"];

const EMPLOYEE_AUTH_ROUTES = [
    "/signup",
    "/login",
    "/forgot-password",
    "/reset-password",
];

function isPathInsideRoute(pathname: string, route: string) {
    return pathname === route || pathname.startsWith(`${route}/`);
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const employerToken =
        request.cookies.get(EMPLOYER_TOKEN_COOKIE)?.value;

    const employeeToken =
        request.cookies.get(EMPLOYEE_TOKEN_COOKIE)?.value;

    /*
     * --------------------------------------------------
     * Employer protection
     * --------------------------------------------------
     *
     * If an employer is logged in and there is no
     * employee session, prevent access to employee routes.
     */

    if (
        employerToken &&
        !employeeToken &&
        EMPLOYEE_ROUTES.some((route) =>
            isPathInsideRoute(pathname, route),
        )
    ) {
        return NextResponse.redirect(
            new URL("/services/employer/profile", request.url),
        );
    }

    /*
     * --------------------------------------------------
     * Employee authentication-route protection
     * --------------------------------------------------
     *
     * If an employee is logged in, don't allow them to
     * visit signup/login/forgot/reset pages.
     */

    if (
        employeeToken &&
        EMPLOYEE_AUTH_ROUTES.some((route) =>
            isPathInsideRoute(pathname, route),
        )
    ) {
        return NextResponse.redirect(
            new URL("/services/employee/profile", request.url),
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/services/employee/:path*",
        "/signup",
        "/login",
        "/forgot-password",
        "/reset-password",
    ],
};