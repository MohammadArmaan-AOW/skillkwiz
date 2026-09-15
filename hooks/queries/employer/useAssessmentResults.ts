"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface AssessmentResultsParams {
    assessmentId: string;
    employeeId?: string;
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
}

interface GradeInput {
    questionId: string;
    awardedPoints: number;
    gradingNote?: string;
}

interface GradeAssessmentPayload {
    assessmentId: string;
    employeeId: string;
    grades: GradeInput[];
}

interface ShortlistCandidatePayload {
    assessmentId: string;
    employeeId: string;
}

async function fetchAssessmentResults({
    assessmentId,
    search,
    status,
    sort,
    page = 1,
    limit = 10,
}: AssessmentResultsParams) {
    const searchParams = new URLSearchParams();

    if (search) {
        searchParams.set("search", search);
    }

    if (status) {
        searchParams.set("status", status);
    }

    if (sort) {
        searchParams.set("sort", sort);
    }

    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const response = await fetch(
        `/api/employer/assessment/${assessmentId}/results?${searchParams.toString()}`,
        {
            method: "GET",
            credentials: "include",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch assessment results.");
    }

    return data;
}

async function fetchCandidateResult({
    assessmentId,
    employeeId,
}: {
    assessmentId: string;
    employeeId: string;
}) {
    const response = await fetch(
        `/api/employer/assessment/${assessmentId}/results/${employeeId}`,
        {
            method: "GET",
            credentials: "include",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch candidate result.");
    }

    return data;
}

async function gradeCandidate(payload: GradeAssessmentPayload) {
    const response = await fetch(
        `/api/employer/assessment/${payload.assessmentId}/results/${payload.employeeId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                grades: payload.grades,
            }),
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Failed to grade candidate.");
    }

    return data;
}

async function shortlistCandidate(payload: ShortlistCandidatePayload) {
    const response = await fetch(
        `/api/employer/assessment/${payload.assessmentId}/shortlist/${payload.employeeId}`,
        {
            method: "POST",
            credentials: "include",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Failed to shortlist candidate.");
    }

    return data;
}

export function useAssessmentResults({
    assessmentId,
    employeeId,
    search = "",
    status = "",
    sort = "percentage-desc",
    page = 1,
    limit = 10,
}: AssessmentResultsParams) {
    const queryClient = useQueryClient();

    /*
     * ============================================================
     * ASSESSMENT RESULTS
     * ============================================================
     */

    const resultsQuery = useQuery({
        queryKey: [
            "assessment-results",
            assessmentId,
            {
                search,
                status,
                sort,
                page,
                limit,
            },
        ],

        queryFn: () =>
            fetchAssessmentResults({
                assessmentId,
                search,
                status,
                sort,
                page,
                limit,
            }),

        enabled: Boolean(assessmentId) && !employeeId,
    });

    /*
     * ============================================================
     * CANDIDATE RESULT
     * ============================================================
     */

    const candidateResultQuery = useQuery({
        queryKey: ["assessment-result", assessmentId, employeeId],

        queryFn: () =>
            fetchCandidateResult({
                assessmentId,
                employeeId: employeeId!,
            }),

        enabled: Boolean(assessmentId) && Boolean(employeeId),
    });

    /*
     * ============================================================
     * NORMALIZED CANDIDATE QUESTIONS
     *
     * Backend returns:
     *
     * candidateResult.questions[]
     *
     * with:
     *
     * question.answer
     * question.grading
     *
     * The UI gets a simpler result shape here.
     * ============================================================
     */

    const candidateQuestions = candidateResultQuery.data?.questions ?? [];

    const candidateAnswers = candidateQuestions.map((question: any) => ({
        questionId: question.questionId,
        order: question.order,

        question: question.question,
        type: question.type,
        points: question.points,
        required: question.required,

        selectionType: question.selectionType ?? null,

        options: question.options ?? [],

        correctOptionIds: question.correctOptionIds ?? [],

        language: question.language ?? null,

        starterCode: question.starterCode ?? null,

        inputDescription: question.inputDescription ?? null,

        outputDescription: question.outputDescription ?? null,

        constraints: question.constraints ?? null,

        minLength: question.minLength ?? null,

        maxLength: question.maxLength ?? null,

        answerPlaceholder: question.answerPlaceholder ?? null,

        autoEvaluate: question.autoEvaluate ?? false,

        explanation: question.explanation ?? null,

        answer: question.answer?.answer ?? null,

        selectedOptions: question.answer?.selectedOptions ?? [],

        answeredAt: question.answer?.answeredAt ?? null,

        isCorrect: question.answer?.isCorrect ?? null,

        awardedPoints: question.grading?.awardedPoints ?? 0,

        gradingNote: question.grading?.gradingNote ?? null,

        manuallyGraded: question.grading?.manuallyGraded ?? false,

        gradedAt: question.grading?.gradedAt ?? null,

        gradingType: question.grading?.gradingType ?? "manual",
    }));

    /*
     * ============================================================
     * GRADING
     * ============================================================
     */

    const gradeMutation = useMutation({
        mutationFn: gradeCandidate,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["assessment-results", variables.assessmentId],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "assessment-result",
                    variables.assessmentId,
                    variables.employeeId,
                ],
            });
        },
    });

    /*
     * ============================================================
     * SHORTLIST
     * ============================================================
     */

    const shortlistMutation = useMutation({
        mutationFn: shortlistCandidate,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["assessment-results", variables.assessmentId],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "assessment-result",
                    variables.assessmentId,
                    variables.employeeId,
                ],
            });
        },
    });

    /*
     * ============================================================
     * RETURN
     * ============================================================
     */

    return {
        /*
         * --------------------------------------------------------
         * Results
         * --------------------------------------------------------
         */

        results: resultsQuery.data?.results ?? [],

        assessment: resultsQuery.data?.assessment,

        total: resultsQuery.data?.pagination?.total ?? 0,

        currentPage: resultsQuery.data?.pagination?.page ?? page,

        limit: resultsQuery.data?.pagination?.limit ?? limit,

        totalPages: resultsQuery.data?.pagination?.totalPages ?? 0,

        hasNextPage: resultsQuery.data?.pagination?.hasNextPage ?? false,

        hasPreviousPage:
            resultsQuery.data?.pagination?.hasPreviousPage ?? false,

        isLoading: resultsQuery.isLoading,

        isFetching: resultsQuery.isFetching,

        error: resultsQuery.error,

        refetch: resultsQuery.refetch,

        /*
         * --------------------------------------------------------
         * Candidate result
         * --------------------------------------------------------
         */

        candidateResult: candidateResultQuery.data,

        candidateAnswers,

        candidateQuestions,

        isCandidateResultLoading: candidateResultQuery.isLoading,

        isCandidateResultFetching: candidateResultQuery.isFetching,

        candidateResultError: candidateResultQuery.error,

        refetchCandidateResult: candidateResultQuery.refetch,

        /*
         * --------------------------------------------------------
         * Grading
         * --------------------------------------------------------
         */

        gradeCandidate: gradeMutation.mutateAsync,

        isGrading: gradeMutation.isPending,

        gradingError: gradeMutation.error,

        /*
         * --------------------------------------------------------
         * Shortlisting
         * --------------------------------------------------------
         */

        shortlistCandidate: shortlistMutation.mutateAsync,

        isShortlisting: shortlistMutation.isPending,

        shortlistError: shortlistMutation.error,
    };
}
