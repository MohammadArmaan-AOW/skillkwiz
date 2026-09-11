"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    AssessmentListParams,
    AssessmentRole,
    EmployeeAssessmentListParams,
    SaveAssessmentAnswerPayload,
    createEmployerAssessment,
    deleteEmployerAssessment,
    fetchEmployeeAssessment,
    fetchEmployeeAssessments,
    fetchEmployerAssessment,
    fetchEmployerAssessments,
    recordEmployeeAssessmentTabChange,
    saveEmployeeAssessmentAnswer,
    startEmployeeAssessment,
    submitEmployeeAssessment,
    updateEmployerAssessment,
} from "@/lib/assessments/assessmentService";

/*
 * ============================================================
 * QUERY KEYS
 * ============================================================
 */

export const assessmentQueryKeys = {
    all: ["assessments"] as const,

    employer: {
        all: ["assessments", "employer"] as const,

        lists: () => ["assessments", "employer", "list"] as const,

        list: (params?: AssessmentListParams) =>
            ["assessments", "employer", "list", params ?? {}] as const,

        details: () => ["assessments", "employer", "detail"] as const,

        detail: (id: string) =>
            ["assessments", "employer", "detail", id] as const,
    },

    employee: {
        all: ["assessments", "employee"] as const,

        lists: () => ["assessments", "employee", "list"] as const,

        list: (params?: EmployeeAssessmentListParams) =>
            ["assessments", "employee", "list", params ?? {}] as const,

        details: () => ["assessments", "employee", "detail"] as const,

        detail: (id: string) =>
            ["assessments", "employee", "detail", id] as const,
    },
};

/*
 * ============================================================
 * HOOK OPTIONS
 * ============================================================
 */

interface UseAssessmentOptions {
    role: AssessmentRole;
    assessmentId?: string;
    employerListParams?: AssessmentListParams;
    employeeListParams?: EmployeeAssessmentListParams;
    enabled?: boolean;
}
/*
 * ============================================================
 * GLOBAL useAssessment HOOK
 * ============================================================
 */

export function useAssessment({
    role,
    assessmentId,
    employerListParams,
    employeeListParams,
    enabled = true,
}: UseAssessmentOptions) {
    const queryClient = useQueryClient();

    /*
     * ==========================================================
     * EMPLOYER QUERIES
     * ==========================================================
     */

    const employerAssessmentsQuery = useQuery({
        queryKey: assessmentQueryKeys.employer.list(employerListParams),
        queryFn: () => fetchEmployerAssessments(employerListParams),
        enabled: enabled && role === "employer",
    });

    const employerAssessmentQuery = useQuery({
        queryKey: assessmentId
            ? assessmentQueryKeys.employer.detail(assessmentId)
            : assessmentQueryKeys.employer.details(),
        queryFn: () => fetchEmployerAssessment(assessmentId as string),
        enabled: enabled && role === "employer" && !!assessmentId,
    });

    /*
     * ==========================================================
     * EMPLOYEE QUERIES
     * ==========================================================
     */

    const employeeAssessmentsQuery = useQuery({
        queryKey: assessmentQueryKeys.employee.list(employeeListParams),

        queryFn: () => fetchEmployeeAssessments(employeeListParams),

        enabled: enabled && role === "employee",

        placeholderData: (previousData) => previousData,
    });

    const employeeAssessmentQuery = useQuery({
        queryKey: assessmentId
            ? assessmentQueryKeys.employee.detail(assessmentId)
            : assessmentQueryKeys.employee.details(),
        queryFn: () => fetchEmployeeAssessment(assessmentId as string),
        enabled: enabled && role === "employee" && !!assessmentId,
    });

    /*
     * ==========================================================
     * EMPLOYER MUTATIONS
     * ==========================================================
     */

    const createAssessmentMutation = useMutation({
        mutationFn: createEmployerAssessment,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employer.lists(),
            });
        },
    });

    const updateAssessmentMutation = useMutation({
        mutationFn: updateEmployerAssessment,

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employer.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employer.detail(
                    variables.assessmentId,
                ),
            });
        },
    });

    const deleteAssessmentMutation = useMutation({
        mutationFn: deleteEmployerAssessment,

        onSuccess: (_data, assessmentId) => {
            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employer.lists(),
            });

            queryClient.removeQueries({
                queryKey: assessmentQueryKeys.employer.detail(assessmentId),
            });
        },
    });

    /*
     * ==========================================================
     * EMPLOYEE MUTATIONS
     * ==========================================================
     */

    const startAssessmentMutation = useMutation({
        mutationFn: startEmployeeAssessment,

        onSuccess: (_data, assessmentId) => {
            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employee.detail(assessmentId),
            });

            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employee.lists(),
            });
        },
    });

    const saveAnswerMutation = useMutation({
        mutationFn: saveEmployeeAssessmentAnswer,

        onSuccess: (_data, variables) => {
            /*
             * We intentionally do NOT invalidate the
             * entire assessment query after every answer.
             *
             * Answer autosave can happen frequently, so
             * unnecessary refetching would be expensive.
             */
            queryClient.setQueryData(
                assessmentQueryKeys.employee.detail(variables.assessmentId),
                (currentData: unknown) => currentData,
            );
        },
    });

    const submitAssessmentMutation = useMutation({
        mutationFn: submitEmployeeAssessment,

        onSuccess: (_data, assessmentId) => {
            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employee.detail(assessmentId),
            });

            queryClient.invalidateQueries({
                queryKey: assessmentQueryKeys.employee.lists(),
            });
        },
    });

    const tabChangeMutation = useMutation({
        mutationFn: recordEmployeeAssessmentTabChange,

        onSuccess: (_data, assessmentId) => {
            /*
             * Do not refetch the entire assessment just
             * because a tab change was recorded.
             */
        },
    });

    /*
     * ==========================================================
     * RETURN
     * ==========================================================
     */

    return {
        /*
         * ------------------------------------------------------
         * Employer Queries
         * ------------------------------------------------------
         */

        employerAssessments: employerAssessmentsQuery.data,

        isEmployerAssessmentsLoading: employerAssessmentsQuery.isLoading,

        isEmployerAssessmentsFetching: employerAssessmentsQuery.isFetching,

        employerAssessmentsError: employerAssessmentsQuery.error,

        refetchEmployerAssessments: employerAssessmentsQuery.refetch,

        employerAssessment: employerAssessmentQuery.data,

        isEmployerAssessmentLoading: employerAssessmentQuery.isLoading,

        isEmployerAssessmentFetching: employerAssessmentQuery.isFetching,

        employerAssessmentError: employerAssessmentQuery.error,

        refetchEmployerAssessment: employerAssessmentQuery.refetch,

        /*
         * ------------------------------------------------------
         * Employer Mutations
         * ------------------------------------------------------
         */

        createAssessment: createAssessmentMutation.mutateAsync,

        isCreatingAssessment: createAssessmentMutation.isPending,

        createAssessmentError: createAssessmentMutation.error,

        createAssessmentSuccess: createAssessmentMutation.isSuccess,

        resetCreateAssessment: createAssessmentMutation.reset,

        updateAssessment: updateAssessmentMutation.mutateAsync,

        isUpdatingAssessment: updateAssessmentMutation.isPending,

        updateAssessmentError: updateAssessmentMutation.error,

        updateAssessmentSuccess: updateAssessmentMutation.isSuccess,

        resetUpdateAssessment: updateAssessmentMutation.reset,

        deleteAssessment: deleteAssessmentMutation.mutateAsync,

        isDeletingAssessment: deleteAssessmentMutation.isPending,

        deleteAssessmentError: deleteAssessmentMutation.error,

        deleteAssessmentSuccess: deleteAssessmentMutation.isSuccess,

        resetDeleteAssessment: deleteAssessmentMutation.reset,

        /*
         * ------------------------------------------------------
         * Employee Queries
         * ------------------------------------------------------
         */

        employeeAssessments: employeeAssessmentsQuery.data,

        isEmployeeAssessmentsLoading: employeeAssessmentsQuery.isLoading,

        isEmployeeAssessmentsFetching: employeeAssessmentsQuery.isFetching,

        employeeAssessmentsError: employeeAssessmentsQuery.error,

        refetchEmployeeAssessments: employeeAssessmentsQuery.refetch,

        employeeAssessment: employeeAssessmentQuery.data,

        isEmployeeAssessmentLoading: employeeAssessmentQuery.isLoading,

        isEmployeeAssessmentFetching: employeeAssessmentQuery.isFetching,

        employeeAssessmentError: employeeAssessmentQuery.error,

        refetchEmployeeAssessment: employeeAssessmentQuery.refetch,

        /*
         * ------------------------------------------------------
         * Employee Mutations
         * ------------------------------------------------------
         */

        startAssessment: startAssessmentMutation.mutateAsync,

        isStartingAssessment: startAssessmentMutation.isPending,

        startAssessmentError: startAssessmentMutation.error,

        startAssessmentSuccess: startAssessmentMutation.isSuccess,

        resetStartAssessment: startAssessmentMutation.reset,

        saveAnswer: saveAnswerMutation.mutateAsync,

        isSavingAnswer: saveAnswerMutation.isPending,

        saveAnswerError: saveAnswerMutation.error,

        saveAnswerSuccess: saveAnswerMutation.isSuccess,

        resetSaveAnswer: saveAnswerMutation.reset,

        submitAssessment: submitAssessmentMutation.mutateAsync,

        isSubmittingAssessment: submitAssessmentMutation.isPending,

        submitAssessmentError: submitAssessmentMutation.error,

        submitAssessmentSuccess: submitAssessmentMutation.isSuccess,

        resetSubmitAssessment: submitAssessmentMutation.reset,

        recordTabChange: tabChangeMutation.mutateAsync,

        isRecordingTabChange: tabChangeMutation.isPending,

        recordTabChangeError: tabChangeMutation.error,

        recordTabChangeSuccess: tabChangeMutation.isSuccess,

        resetRecordTabChange: tabChangeMutation.reset,
    };
}
