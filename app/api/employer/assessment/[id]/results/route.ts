import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireEmployer } from "@/lib/auth/requireEmployer";
import Employee from "@/lib/db/employeeSchema";
import { connectDB } from "@/lib/db/db";
import Assessment from "@/lib/db/assessmentSchema";
import AssessmentAttempt from "@/lib/db/assessmentAttemptSchema";

function errorResponse(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        // ---------------------------------------------------------
        // 1. Authenticate employer
        // ---------------------------------------------------------
        const employer = await requireEmployer();

        if (!employer) {
            return errorResponse("Unauthorized", 401);
        }

        // ---------------------------------------------------------
        // 2. Get assessment ID
        // ---------------------------------------------------------
        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse("Invalid assessment ID", 400);
        }

        await connectDB();

        // ---------------------------------------------------------
        // 3. Get complete assessment owned by employer
        // ---------------------------------------------------------
        const assessment = await Assessment.findOne({
            _id: id,
            employerId: employer._id,
        }).lean();

        if (!assessment) {
            return errorResponse("Assessment not found", 404);
        }

        // ---------------------------------------------------------
        // 4. Pagination
        // ---------------------------------------------------------
        const searchParams = request.nextUrl.searchParams;

        const pageParam = Number(searchParams.get("page") || "1");
        const limitParam = Number(searchParams.get("limit") || "10");

        const page =
            Number.isFinite(pageParam) && pageParam > 0
                ? Math.floor(pageParam)
                : 1;

        const limit =
            Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
                ? Math.floor(limitParam)
                : 10;

        const skip = (page - 1) * limit;

        // ---------------------------------------------------------
        // 5. Search
        // ---------------------------------------------------------
        const search = searchParams.get("search")?.trim() || "";

        // ---------------------------------------------------------
        // 6. Sorting
        // ---------------------------------------------------------
        //
        // Supported:
        // - highest-score
        // - lowest-score
        // - name-asc
        // - name-desc
        // - newest
        // - oldest
        //
        const sort = searchParams.get("sort") || "highest-score";

        // ---------------------------------------------------------
        // 7. Get assigned employee IDs
        // ---------------------------------------------------------
        const assignedEmployees = assessment.assignedEmployees || [];

        const assignedEmployeeIds = assignedEmployees.map(
            (assignment) => assignment.employeeId,
        );

        // No assigned employees
        if (assignedEmployeeIds.length === 0) {
            return NextResponse.json({
                success: true,

                assessment,

                results: [],

                pagination: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
            });
        }

        // ---------------------------------------------------------
        // 8. Get employees
        // ---------------------------------------------------------
        //
        // We intentionally fetch only employees assigned to this
        // assessment.
        //
        const employeeQuery: Record<string, unknown> = {
            _id: { $in: assignedEmployeeIds },
        };

        if (search) {
            employeeQuery.$or = [
                {
                    fullName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    firstName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    lastName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const employees = await Employee.find(employeeQuery)
            .select("_id fullName firstName lastName email")
            .lean();

        // ---------------------------------------------------------
        // 9. Create employee lookup
        // ---------------------------------------------------------
        const employeeMap = new Map(
            employees.map((employee) => [employee._id.toString(), employee]),
        );

        // ---------------------------------------------------------
        // 10. Get attempts for this assessment
        // ---------------------------------------------------------
        //
        // We fetch all attempts for assigned employees so that:
        //
        // - not-started employees remain visible
        // - in-progress employees remain visible
        // - completed employees have their score
        // - expired employees remain visible
        //
        const attempts = await AssessmentAttempt.find({
            assessmentId: assessment._id,
            employeeId: { $in: assignedEmployeeIds },
        })
            .sort({
                createdAt: -1,
            })
            .lean();

        // ---------------------------------------------------------
        // 11. Keep the latest attempt for each employee
        // ---------------------------------------------------------
        const attemptMap = new Map<string, (typeof attempts)[number]>();

        for (const attempt of attempts) {
            const employeeId = attempt.employeeId.toString();

            if (!attemptMap.has(employeeId)) {
                attemptMap.set(employeeId, attempt);
            }
        }

        // ---------------------------------------------------------
        // 12. Build result rows
        // ---------------------------------------------------------
        const resultRows = [];

        for (const assignment of assignedEmployees) {
            const employeeId = assignment.employeeId.toString();

            const employee = employeeMap.get(employeeId);

            // Employee may have been removed/deleted.
            if (!employee) {
                continue;
            }

            const attempt = attemptMap.get(employeeId);

            const fullName = employee.fullName;

            resultRows.push({
                employee: {
                    id: employee._id,
                    fullName,
                    email: employee.email,
                },

                assignment: {
                    status: assignment.status,
                    assignedAt: assignment.assignedAt,
                    emailSentAt: assignment.emailSentAt,
                    startedAt: assignment.startedAt,
                    submittedAt: assignment.submittedAt,

                    shortlisted: assignment.shortlisted ?? false,
                    shortlistedAt: assignment.shortlistedAt ?? null,
                    shortlistEmailSentAt:
                        assignment.shortlistEmailSentAt ?? null,
                },

                attempt: attempt
                    ? {
                          id: attempt._id,
                          status: attempt.status,
                          score: attempt.score ?? null,
                          percentage: attempt.percentage ?? null,
                          submittedAt: attempt.submittedAt ?? null,
                          startedAt: attempt.startedAt,
                          expiresAt: attempt.expiresAt ?? null,
                          submissionType: attempt.submissionType ?? null,
                          tabChangeCount: attempt.tabChangeCount ?? 0,
                          passed: attempt.passed ?? null,
                      }
                    : null,
            });
        }

        // ---------------------------------------------------------
        // 13. Sort
        // ---------------------------------------------------------
        resultRows.sort((a, b) => {
            switch (sort) {
                case "lowest-score": {
                    const aPercentage = a.attempt?.percentage ?? -1;

                    const bPercentage = b.attempt?.percentage ?? -1;

                    if (aPercentage !== bPercentage) {
                        return aPercentage - bPercentage;
                    }

                    return a.employee.fullName.localeCompare(
                        b.employee.fullName,
                    );
                }

                case "name-asc":
                    return a.employee.fullName.localeCompare(
                        b.employee.fullName,
                    );

                case "name-desc":
                    return b.employee.fullName.localeCompare(
                        a.employee.fullName,
                    );

                case "oldest": {
                    const aDate =
                        a.attempt?.submittedAt ||
                        a.attempt?.startedAt ||
                        a.assignment.assignedAt ||
                        0;

                    const bDate =
                        b.attempt?.submittedAt ||
                        b.attempt?.startedAt ||
                        b.assignment.assignedAt ||
                        0;

                    return (
                        new Date(aDate).getTime() - new Date(bDate).getTime()
                    );
                }

                case "newest": {
                    const aDate =
                        a.attempt?.submittedAt ||
                        a.attempt?.startedAt ||
                        a.assignment.assignedAt ||
                        0;

                    const bDate =
                        b.attempt?.submittedAt ||
                        b.attempt?.startedAt ||
                        b.assignment.assignedAt ||
                        0;

                    return (
                        new Date(bDate).getTime() - new Date(aDate).getTime()
                    );
                }

                case "highest-score":
                default: {
                    const aPercentage = a.attempt?.percentage ?? -1;

                    const bPercentage = b.attempt?.percentage ?? -1;

                    if (aPercentage !== bPercentage) {
                        return bPercentage - aPercentage;
                    }

                    return a.employee.fullName.localeCompare(
                        b.employee.fullName,
                    );
                }
            }
        });

        // ---------------------------------------------------------
        // 14. Pagination after filtering + sorting
        // ---------------------------------------------------------
        const total = resultRows.length;

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        const paginatedResults = resultRows.slice(skip, skip + limit);

        // ---------------------------------------------------------
        // 15. Response
        // ---------------------------------------------------------
        return NextResponse.json({
            success: true,

            assessment,

            results: paginatedResults,

            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error(
            "GET /api/employer/assessment/[id]/results error:",
            error,
        );

        return errorResponse("Failed to fetch assessment results", 500);
    }
}
