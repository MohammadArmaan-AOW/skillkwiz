"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type EmployerProfile = {
    id: string;
    fullName: string;
    email: string;
    emailVerified: boolean;
    googleId?: string | null;
    authProvider: "email" | "google";
    profilePhoto?: string | null;
    phoneNumber?: string;
    companyName?: string;
    companyAddress?: string;
    department?: string;
    authorizedToPay: boolean;
    authorizationDetails?: string | null;
    createdAt: string;
    updatedAt: string;
};

type EmployerProfileResponse = {
    success: boolean;
    employer: EmployerProfile;
    message?: string;
};

type UpdateEmployerProfileData = {
    fullName: string;
    profilePhoto?: string | null;
    phoneNumber?: string;
    companyName?: string;
    companyAddress?: string;
    department?: string;
};

type UpdatePasswordData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type ApiErrorResponse = {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
};

type ApiError = {
    message: string;
    errors?: Record<string, string[]>;
};

/* -------------------------------------------------------------------------- */
/*                              Query Functions                               */
/* -------------------------------------------------------------------------- */

async function fetchEmployerProfile(): Promise<EmployerProfileResponse> {
    const response = await axios.get<EmployerProfileResponse>(
        "/api/employer/profile",
        {
            withCredentials: true,
        },
    );

    return response.data;
}

/* -------------------------------------------------------------------------- */
/*                              Mutation Functions                            */
/* -------------------------------------------------------------------------- */

async function updateEmployerProfile(
    data: UpdateEmployerProfileData,
): Promise<EmployerProfileResponse> {
    const response =
        await axios.patch<EmployerProfileResponse>(
            "/api/employer/profile",
            data,
            {
                withCredentials: true,
            },
        );

    return response.data;
}

async function updateEmployerPassword(
    data: UpdatePasswordData,
): Promise<{ success: boolean; message: string }> {
    const response = await axios.patch<{
        success: boolean;
        message: string;
    }>(
        "/api/employer/profile/password",
        data,
        {
            withCredentials: true,
        },
    );

    return response.data;
}

/* -------------------------------------------------------------------------- */
/*                              Error Handling                                */
/* -------------------------------------------------------------------------- */

function getApiError(error: unknown): ApiError {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return {
            message:
                error.response?.data?.message ??
                "Something went wrong. Please try again.",
            errors: error.response?.data?.errors,
        };
    }

    return {
        message:
            "Something went wrong. Please try again.",
    };
}

/* -------------------------------------------------------------------------- */
/*                              Main Hook                                     */
/* -------------------------------------------------------------------------- */

export function useEmployerProfile() {
    const queryClient = useQueryClient();

    /* -------------------------------- Query -------------------------------- */

    const profileQuery = useQuery<
        EmployerProfileResponse,
        ApiError
    >({
        queryKey: ["employer", "profile"],

        queryFn: async () => {
            try {
                return await fetchEmployerProfile();
            } catch (error) {
                throw getApiError(error);
            }
        },

        retry: false,

        refetchOnWindowFocus: false,

        staleTime: 5 * 60 * 1000,
    });

    /* -------------------------- Profile Mutation -------------------------- */

    const updateProfileMutation =
        useMutation<
            EmployerProfileResponse,
            ApiError,
            UpdateEmployerProfileData
        >({
            mutationFn: async (data) => {
                try {
                    return await updateEmployerProfile(
                        data,
                    );
                } catch (error) {
                    throw getApiError(error);
                }
            },

            onSuccess: async (data) => {
                /*
                 * Update the cached profile immediately with
                 * the response returned by the API.
                 */
                queryClient.setQueryData(
                    ["employer", "profile"],
                    data,
                );

                /*
                 * Also update the global employer session
                 * query because the profile data has changed.
                 */
                queryClient.setQueryData(
                    ["employer", "me"],
                    {
                        success: true,
                        authenticated: true,
                        employer: data.employer,
                    },
                );

                await queryClient.invalidateQueries({
                    queryKey: ["employer", "profile"],
                });

                await queryClient.invalidateQueries({
                    queryKey: ["employer", "me"],
                });
            },
        });

    /* -------------------------- Password Mutation -------------------------- */

    const updatePasswordMutation =
        useMutation<
            { success: boolean; message: string },
            ApiError,
            UpdatePasswordData
        >({
            mutationFn: async (data) => {
                try {
                    return await updateEmployerPassword(
                        data,
                    );
                } catch (error) {
                    throw getApiError(error);
                }
            },
        });

    /* -------------------------------- Return -------------------------------- */

    return {
        /* Profile query */
        profile: profileQuery.data?.employer ?? null,
        profileResponse: profileQuery.data,

        isLoading: profileQuery.isPending,
        isFetching: profileQuery.isFetching,
        isError: profileQuery.isError,
        error: profileQuery.error,

        refetchProfile: profileQuery.refetch,

        /* Profile update */
        updateProfile:
            updateProfileMutation.mutateAsync,

        isUpdatingProfile:
            updateProfileMutation.isPending,

        updateProfileError:
            updateProfileMutation.error,

        updateProfileSuccess:
            updateProfileMutation.isSuccess,

        updateProfileResponse:
            updateProfileMutation.data,

        resetUpdateProfile:
            updateProfileMutation.reset,

        /* Password update */
        updatePassword:
            updatePasswordMutation.mutateAsync,

        isUpdatingPassword:
            updatePasswordMutation.isPending,

        updatePasswordError:
            updatePasswordMutation.error,

        updatePasswordSuccess:
            updatePasswordMutation.isSuccess,

        updatePasswordResponse:
            updatePasswordMutation.data,

        resetUpdatePassword:
            updatePasswordMutation.reset,
    };
}