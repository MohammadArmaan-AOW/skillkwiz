import { NextRequest, NextResponse } from "next/server";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import { connectDB } from "@/lib/db/db";
import Employee from "@/lib/db/employeeSchema";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const ALLOWED_SORTS = [
    "newest",
    "oldest",
    "name-asc",
    "name-desc",
] as const;

type SortOption = (typeof ALLOWED_SORTS)[number];

export async function GET(request: NextRequest) {
    try {
        /**
         * Authenticate employer.
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

        await connectDB();

        /**
         * Read query parameters.
         */
        const searchParams = request.nextUrl.searchParams;

        const search =
            searchParams.get("search")?.trim() || "";

        const status =
            searchParams.get("status") || "all";

        const signedIn =
            searchParams.get("signedIn") || "all";

        const sort =
            (searchParams.get("sort") as SortOption) ||
            "newest";

        const requestedPage = Number(
            searchParams.get("page") || DEFAULT_PAGE,
        );

        const requestedLimit = Number(
            searchParams.get("limit") || DEFAULT_LIMIT,
        );

        const page =
            Number.isFinite(requestedPage) &&
            requestedPage > 0
                ? Math.floor(requestedPage)
                : DEFAULT_PAGE;

        const limit =
            Number.isFinite(requestedLimit) &&
            requestedLimit > 0
                ? Math.min(
                      Math.floor(requestedLimit),
                      MAX_LIMIT,
                  )
                : DEFAULT_LIMIT;

        /**
         * ---------------------------------------------------------
         * Build query
         * ---------------------------------------------------------
         *
         * Always restrict employees to the authenticated employer.
         */
        const query: Record<string, unknown> = {
            employerId: employer._id,
        };

        /**
         * Search
         *
         * Search by:
         * - employee ID
         * - full name
         * - email
         */
        if (search) {
            const searchRegex = new RegExp(
                escapeRegex(search),
                "i",
            );

            query.$or = [
                {
                    employeeId: searchRegex,
                },
                {
                    fullName: searchRegex,
                },
                {
                    email: searchRegex,
                },
            ];
        }

        /**
         * Active / inactive filter.
         */
        if (status === "active") {
            query.isActive = true;
        }

        if (status === "inactive") {
            query.isActive = false;
        }

        /**
         * Signed-in filter.
         */
        if (signedIn === "signed-in") {
            query.hasSignedIn = true;
        }

        if (signedIn === "not-signed-in") {
            query.hasSignedIn = false;
        }

        /**
         * ---------------------------------------------------------
         * Sorting
         * ---------------------------------------------------------
         */
        let sortQuery: Record<string, 1 | -1>;

        switch (sort) {
            case "oldest":
                sortQuery = {
                    createdAt: 1,
                };
                break;

            case "name-asc":
                sortQuery = {
                    fullName: 1,
                };
                break;

            case "name-desc":
                sortQuery = {
                    fullName: -1,
                };
                break;

            case "newest":
            default:
                sortQuery = {
                    createdAt: -1,
                };
                break;
        }

        /**
         * ---------------------------------------------------------
         * Pagination
         * ---------------------------------------------------------
         */
        const skip = (page - 1) * limit;

        /**
         * Get total count and current page together.
         */
        const [employees, total] = await Promise.all([
            Employee.find(query)
                .select(
                    [
                        "employeeId",
                        "fullName",
                        "email",
                        "phoneNumber",
                        "department",
                        "designation",
                        "emailVerified",
                        "hasSignedIn",
                        "firstSignedInAt",
                        "lastSignedInAt",
                        "invitationSentAt",
                        "mustChangePassword",
                        "isActive",
                        "creditConsumed",
                        "creditConsumedAt",
                        "createdAt",
                        "updatedAt",
                    ].join(" "),
                )
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean(),

            Employee.countDocuments(query),
        ]);

        const totalPages = Math.max(
            1,
            Math.ceil(total / limit),
        );

        /**
         * If a page greater than the available pages was requested,
         * return an empty list rather than failing.
         */
        return NextResponse.json(
            {
                success: true,
                count: employees.length,
                total,
                page,
                limit,
                totalPages,
                employees,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error(
            "Fetch employer employees error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch employees.",
            },
            {
                status: 500,
            },
        );
    }
}

/**
 * Prevent regex special characters from changing the
 * meaning of the user's search string.
 */
function escapeRegex(value: string): string {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
    );
}