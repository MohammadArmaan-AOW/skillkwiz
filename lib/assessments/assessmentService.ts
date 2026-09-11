/*
 * ============================================================
 * TYPES
 * ============================================================
 */

import apiClient from "../apiClient";

export type AssessmentRole = "employer" | "employee";

export type AssessmentStatus = "draft" | "published" | "closed" | "archived";

export type AssessmentQuestionType =
    | "short-text"
    | "long-text"
    | "coding"
    | "project-report"
    | "mcq";

export interface SaveAssessmentAnswerPayload {
    questionId: string;
    answer?: string;
    selectedOptions?: string[];
}
export type AssessmentAssignmentStatus =
    | "assigned"
    | "in-progress"
    | "completed"
    | "expired";

export type AssessmentSort = "newest" | "oldest" | "name-asc" | "name-desc";

export interface AssessmentListParams {
    search?: string;
    status?: AssessmentStatus | "all";
    sort?: AssessmentSort;
    page?: number;
    limit?: number;
}

export interface EmployeeAssessmentListParams {
    search?: string;
    status?: AssessmentAssignmentStatus | "all";
    sort?: AssessmentSort;
    page?: number;
    limit?: number;
}
/*
 * ============================================================
 * EMPLOYER API
 * ============================================================
 */

export const fetchEmployerAssessments = async (
    params?: AssessmentListParams,
) => {
    const searchParams = new URLSearchParams();

    if (params?.search) {
        searchParams.set("search", params.search);
    }

    if (params?.status && params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params?.sort) {
        searchParams.set("sort", params.sort);
    }

    if (params?.page) {
        searchParams.set("page", String(params.page));
    }

    if (params?.limit) {
        searchParams.set("limit", String(params.limit));
    }

    const query = searchParams.toString();

    const response = await apiClient.get(
        `/api/employer/assessment${query ? `?${query}` : ""}`,
    );

    return response.data;
};

export const fetchEmployerAssessment = async (assessmentId: string) => {
    const response = await apiClient.get(
        `/api/employer/assessment/${assessmentId}`,
    );

    return response.data;
};

export const createEmployerAssessment = async (payload: unknown) => {
    const response = await apiClient.post("/api/employer/assessment", payload);

    return response.data;
};

export const updateEmployerAssessment = async ({
    assessmentId,
    payload,
}: {
    assessmentId: string;
    payload: unknown;
}) => {
    const response = await apiClient.patch(
        `/api/employer/assessment/${assessmentId}`,
        payload,
    );

    return response.data;
};

export const deleteEmployerAssessment = async (assessmentId: string) => {
    const response = await apiClient.delete(
        `/api/employer/assessment/${assessmentId}`,
    );

    return response.data;
};

/*
 * ============================================================
 * EMPLOYEE API
 * ============================================================
 */

export const fetchEmployeeAssessments = async (
    params?: EmployeeAssessmentListParams,
) => {
    const searchParams = new URLSearchParams();

    if (params?.search) {
        searchParams.set("search", params.search);
    }

    if (params?.status && params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params?.sort) {
        searchParams.set("sort", params.sort);
    }

    if (params?.page) {
        searchParams.set("page", String(params.page));
    }

    if (params?.limit) {
        searchParams.set("limit", String(params.limit));
    }

    const query = searchParams.toString();

    const response = await apiClient.get(
        `/api/employee/assessment${query ? `?${query}` : ""}`,
    );

    return response.data;
};

export const fetchEmployeeAssessment = async (assessmentId: string) => {
    const response = await apiClient.get(
        `/api/employee/assessment/${assessmentId}`,
    );

    return response.data;
};

export const startEmployeeAssessment = async (assessmentId: string) => {
    const response = await apiClient.post(
        `/api/employee/assessment/${assessmentId}/start`,
    );

    return response.data;
};

export const saveEmployeeAssessmentAnswer = async ({
    assessmentId,
    payload,
}: {
    assessmentId: string;
    payload: SaveAssessmentAnswerPayload;
}) => {
    const response = await apiClient.post(
        `/api/employee/assessment/${assessmentId}/answer`,
        payload,
    );

    return response.data;
};

export const submitEmployeeAssessment = async (assessmentId: string) => {
    const response = await apiClient.post(
        `/api/employee/assessment/${assessmentId}/submit`,
    );

    return response.data;
};

export const recordEmployeeAssessmentTabChange = async (
    assessmentId: string,
) => {
    const response = await apiClient.post(
        `/api/employee/assessment/${assessmentId}/tab-change`,
    );

    return response.data;
};
