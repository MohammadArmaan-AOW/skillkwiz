"use client";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";

type AssessmentAuthorizationResponse = {
    success: boolean;
    authorized: boolean;
    credits: number;
    profileComplete: boolean;
    hasCredits: boolean;
    missingDetails: {
        phoneNumber: boolean;
        department: boolean;
        companyName: boolean;
        companyAddress: boolean;
    };
    message?: string;
};

type ApiErrorResponse = {
    success?: boolean;
    message?: string;
};

export type AssessmentAuthorizationError = {
    message: string;
};

async function getAssessmentAuthorization(): Promise<AssessmentAuthorizationResponse> {
    try {
        const response = await axios.get<AssessmentAuthorizationResponse>(
            "/api/employer/assessment/authorization",
            {
                withCredentials: true,
            },
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
            throw {
                message:
                    error.response?.data?.message ??
                    "Unable to check assessment authorization.",
            };
        }

        throw {
            message: "Unable to check assessment authorization.",
        };
    }
}

export function useAssessmentAuthorization() {
    const query = useQuery({
        queryKey: ["employer", "assessment", "authorization"],
        queryFn: getAssessmentAuthorization,
        staleTime: 30 * 1000,
    });

    return {
        authorized: query.data?.authorized ?? false,

        credits: query.data?.credits ?? 0,

        profileComplete: query.data?.profileComplete ?? false,

        hasCredits: query.data?.hasCredits ?? false,

        missingDetails: query.data?.missingDetails ?? {
            phoneNumber: false,
            department: false,
            companyName: false,
            companyAddress: false,
        },

        isLoading: query.isLoading,

        isError: query.isError,

        error:
            (query.error as AssessmentAuthorizationError | null) ?? null,

        refetch: query.refetch,
    };
}