import { NextRequest, NextResponse } from "next/server";
import { requireEmployee } from "@/lib/auth/requireEmployee";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";

type AssessmentSort = "newest" | "oldest" | "name-asc" | "name-desc";

type AssessmentAssignmentStatus =
    | "assigned"
    | "in-progress"
    | "completed"
    | "expired";

const VALID_STATUSES: AssessmentAssignmentStatus[] = [
    "assigned",
    "in-progress",
    "completed",
    "expired",
];

const VALID_SORTS: AssessmentSort[] = [
    "newest",
    "oldest",
    "name-asc",
    "name-desc",
];

function errorResponse(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

export async function GET(request: NextRequest) {
    try {
        const employee = await requireEmployee();

        if (!employee) {
            return errorResponse("Employee authentication required.", 401);
        }

        await connectDB();

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search")?.trim() ?? "";

        const requestedStatus = searchParams.get("status") ?? "all";

        const requestedSort = searchParams.get("sort") ?? "newest";

        const pageParam = Number(searchParams.get("page") ?? "1");

        const limitParam = Number(searchParams.get("limit") ?? "10");

        const page =
            Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

        const limit =
            Number.isInteger(limitParam) && limitParam > 0 && limitParam <= 100
                ? limitParam
                : 10;

        /*
         * ---------------------------------------------------------
         * Validate status
         * ---------------------------------------------------------
         */

        if (
            requestedStatus !== "all" &&
            !VALID_STATUSES.includes(
                requestedStatus as AssessmentAssignmentStatus,
            )
        ) {
            return errorResponse("Invalid assessment status.", 400);
        }

        /*
         * ---------------------------------------------------------
         * Validate sort
         * ---------------------------------------------------------
         */

        if (!VALID_SORTS.includes(requestedSort as AssessmentSort)) {
            return errorResponse("Invalid assessment sort.", 400);
        }

        /*
         * ---------------------------------------------------------
         * Base employee assignment filter
         * ---------------------------------------------------------
         *
         * The employee ID always comes from the authenticated
         * employee session. We never accept employeeId from the
         * client for this endpoint.
         */

        const filter: Record<string, unknown> = {
            "assignedEmployees.employeeId": employee._id,
        };

        /*
         * ---------------------------------------------------------
         * Search
         * ---------------------------------------------------------
         *
         * Search is performed against assessment title and
         * description.
         */

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        /*
         * ---------------------------------------------------------
         * Assignment status filter
         * ---------------------------------------------------------
         *
         * Because assignment status is embedded inside the
         * assessment document, use $elemMatch so the matching
         * employee and matching status belong to the same
         * assignment record.
         */

        if (requestedStatus !== "all") {
            filter.assignedEmployees = {
                $elemMatch: {
                    employeeId: employee._id,
                    status: requestedStatus,
                },
            };
        }

        /*
         * ---------------------------------------------------------
         * Sorting
         * ---------------------------------------------------------
         */

        let sort: Record<string, 1 | -1>;

        switch (requestedSort as AssessmentSort) {
            case "oldest":
                sort = {
                    createdAt: 1,
                };
                break;

            case "name-asc":
                sort = {
                    title: 1,
                };
                break;

            case "name-desc":
                sort = {
                    title: -1,
                };
                break;

            case "newest":
            default:
                sort = {
                    createdAt: -1,
                };
                break;
        }

        /*
         * ---------------------------------------------------------
         * Count
         * ---------------------------------------------------------
         */

        const total = await Assessment.countDocuments(filter);

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        /*
         * ---------------------------------------------------------
         * Pagination safety
         * ---------------------------------------------------------
         */

        const safePage =
            totalPages > 0 && page > totalPages ? totalPages : page;

        const skip = (safePage - 1) * limit;

        /*
         * ---------------------------------------------------------
         * Fetch assessments
         * ---------------------------------------------------------
         *
         * Only return fields required by the employee list.
         *
         * IMPORTANT:
         * We intentionally do not return MCQ isCorrect values.
         */

        const assessments = await Assessment.find(filter)
            .select({
                title: 1,
                description: 1,
                skills: 1,
                questions: 1,
                totalPoints: 1,
                status: 1,
                timing: 1,
                timer: 1,
                resultSettings: 1,
                assignedEmployees: 1,
                createdAt: 1,
                updatedAt: 1,
            })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        /*
         * ---------------------------------------------------------
         * Transform response
         * ---------------------------------------------------------
         *
         * The employee should receive only their own assignment
         * information rather than the complete assignedEmployees
         * array.
         */

        const employeeId = employee._id.toString();

        const employeeAssessments = assessments.map((assessment) => {
            const assignment = assessment.assignedEmployees.find(
                (item) => item.employeeId.toString() === employeeId,
            );

            return {
                _id: assessment._id,
                title: assessment.title,
                description: assessment.description,
                skills: assessment.skills,
                questions: assessment.questions.map((question) => ({
                    questionId: question.questionId,
                    order: question.order,
                    question: question.question,
                    type: question.type,
                    points: question.points,
                    required: question.required,
                })),
                totalPoints: assessment.totalPoints,
                status: assessment.status,
                timing: assessment.timing,
                timer: assessment.timer,
                resultSettings: assessment.resultSettings,
                assignment: assignment
                    ? {
                          assignedAt: assignment.assignedAt,
                          emailSentAt: assignment.emailSentAt,
                          status: assignment.status,
                          startedAt: assignment.startedAt,
                          submittedAt: assignment.submittedAt,
                      }
                    : null,
                createdAt: assessment.createdAt,
                updatedAt: assessment.updatedAt,
            };
        });

        return NextResponse.json(
            {
                success: true,
                assessments: employeeAssessments,
                total,
                page: safePage,
                limit,
                totalPages,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET /api/employee/assessment error:", error);

        return errorResponse("Failed to fetch employee assessments.", 500);
    }
}
