"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type Employer = {
    id: string;
    fullName: string;
    email: string;
    emailVerified: boolean;
    googleId?: string;
    authProvider: "email" | "google";
    profilePhoto?: string | null;
    phoneNumber?: string;
    companyName?: string;
    companyAddress?: string;
    department?: string;
    authorizedToPay: boolean;
    authorizationDetails?: string;
    createdAt: string;
    updatedAt: string;
};

interface EmployerResponse {
    success: boolean;
    authenticated: boolean;
    employer: Employer | null;
    message?: string;
}

interface ApiError {
    message: string;
}

async function fetchCurrentEmployer(): Promise<EmployerResponse> {
    const response = await axios.get<EmployerResponse>(
        "/api/auth/employer/me",
        {
            withCredentials: true,
        },
    );

    return response.data;
}

export function useEmployer() {
    const query = useQuery<EmployerResponse, ApiError>({
        queryKey: ["employer", "me"],
        queryFn: fetchCurrentEmployer,

        /*
         * 401 means the user simply isn't authenticated.
         * Don't continuously retry that request.
         */
        retry: false,

        /*
         * Don't refetch every time the user switches
         * browser tabs.
         */
        refetchOnWindowFocus: false,

        /*
         * Keep the current employer session fresh.
         */
        staleTime: 5 * 60 * 1000,
    });

    const employer =
        query.data?.authenticated && query.data.employer
            ? query.data.employer
            : null;

    return {
        employer,

        isLoading: query.isPending,

        isAuthenticated: Boolean(employer),

        isError: query.isError,

        error: query.error,

        refreshEmployer: query.refetch,
    };
}
