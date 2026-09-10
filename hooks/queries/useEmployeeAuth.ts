"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface Employee {
    _id?: string;
    employeeId: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    department?: string;
    designation?: string;

    emailVerified: boolean;
    hasSignedIn: boolean;
    mustChangePassword: boolean;
    isActive: boolean;

    firstSignedInAt?: string | null;
    lastSignedInAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    code?: string;
    data?: T;
}

interface EmployeeLoginResponse {
    success: boolean;
    message: string;
    requiresOtpVerification: boolean;
    employee: {
        employeeId: string;
        email: string;
        emailVerified: boolean;
        mustChangePassword: boolean;
    };
}

interface VerifyOtpResponse {
    success: boolean;
    message: string;
    requiresPasswordChange: boolean;
    requiresSessionCreation: boolean;
    emailVerified: boolean;
    employee: Employee;
}

interface ChangePasswordResponse {
    employee: Employee;
}

interface EmployeeDetailsResponse {
    employee: Employee;
}

interface EmployeeMeResponse {
    employee: Employee;
}

interface EmployeeListParams {
    search?: string;
    status?: "all" | "active" | "inactive";
    signedIn?: "all" | "signed-in" | "not-signed-in";
    sort?: "newest" | "oldest" | "name-asc" | "name-desc";
    page?: number;
    limit?: number;
}

interface EmployeeListResponse {
    success: boolean;
    count: number;
    total: number;
    employees: Employee[];
    page: number;
    limit: number;
    totalPages: number;
}

/* -------------------------------------------------------------------------- */
/*                              Request Helpers                               */
/* -------------------------------------------------------------------------- */

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result?.message || "Something went wrong. Please try again.",
        );
    }

    return result;
}

/* -------------------------------------------------------------------------- */
/*                          Create Employee                                   */
/* -------------------------------------------------------------------------- */

export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse,
        Error,
        {
            fullName: string;
            email: string;
            phoneNumber?: string;
            department?: string;
            designation?: string;
        }
    >({
        mutationFn: (payload) =>
            apiRequest<ApiResponse>("/api/auth/employee/create", {
                method: "POST",
                body: JSON.stringify(payload),
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["employees"],
            });
        },
    });
}

/* -------------------------------------------------------------------------- */
/*                            Employee List Query                             */
/* -------------------------------------------------------------------------- */

export function useEmployeeList(params: EmployeeListParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.search) {
        searchParams.set("search", params.search);
    }

    if (params.status && params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.signedIn && params.signedIn !== "all") {
        searchParams.set("signedIn", params.signedIn);
    }

    if (params.sort) {
        searchParams.set("sort", params.sort);
    }

    if (params.page) {
        searchParams.set("page", String(params.page));
    }

    if (params.limit) {
        searchParams.set("limit", String(params.limit));
    }

    const queryString = searchParams.toString();

    return useQuery<EmployeeListResponse>({
        queryKey: ["employees", params],
        queryFn: () =>
            apiRequest<EmployeeListResponse>(
                `/api/auth/employee/list${
                    queryString ? `?${queryString}` : ""
                }`,
            ),
        placeholderData: (previousData) => previousData,
    });
}

/* -------------------------------------------------------------------------- */
/*                          Employee Details Query                            */
/* -------------------------------------------------------------------------- */

export function useEmployeeDetails(employeeId?: string) {
    return useQuery<EmployeeDetailsResponse>({
        queryKey: ["employee", employeeId],
        queryFn: () =>
            apiRequest<EmployeeDetailsResponse>(
                `/api/auth/employee/${employeeId}`,
            ),
        enabled: Boolean(employeeId),
    });
}

/* -------------------------------------------------------------------------- */
/*                            Employee / Me Query                             */
/* -------------------------------------------------------------------------- */

export function useEmployeeMe() {
    return useQuery<EmployeeMeResponse>({
        queryKey: ["employee", "me"],
        queryFn: () => apiRequest<EmployeeMeResponse>("/api/auth/employee/me"),
        retry: false,
    });
}

/* -------------------------------------------------------------------------- */
/*                              Employee Login                                */
/* -------------------------------------------------------------------------- */

export function useEmployeeLogin() {
    return useMutation<
        EmployeeLoginResponse,
        Error,
        {
            employeeId: string;
            password: string;
        }
    >({
        mutationFn: ({ employeeId, password }) =>
            apiRequest<EmployeeLoginResponse>("/api/auth/employee/login", {
                method: "POST",
                body: JSON.stringify({
                    employeeId,
                    password,
                }),
            }),
    });
}

/* -------------------------------------------------------------------------- */
/*                              Verify OTP                                    */
/* -------------------------------------------------------------------------- */

export function useVerifyEmployeeOtp() {
    return useMutation<
        VerifyOtpResponse,
        Error,
        {
            employeeId: string;
            otp: string;
        }
    >({
        mutationFn: ({ employeeId, otp }) =>
            apiRequest<VerifyOtpResponse>(
                "/api/auth/employee/verify-otp",
                {
                    method: "POST",
                    body: JSON.stringify({
                        employeeId,
                        otp,
                    }),
                },
            ),
    });
}

/* -------------------------------------------------------------------------- */
/*                           Resend OTP                                       */
/* -------------------------------------------------------------------------- */

export function useResendEmployeeOtp() {
    return useMutation<
        ApiResponse,
        Error,
        {
            employeeId: string;
        }
    >({
        mutationFn: (payload) =>
            apiRequest<ApiResponse>("/api/auth/employee/resend-otp", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
    });
}

/* -------------------------------------------------------------------------- */
/*                         Change Password                                    */
/* -------------------------------------------------------------------------- */

export function useChangeEmployeePassword() {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse<ChangePasswordResponse>,
        Error,
        {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        }
    >({
        mutationFn: (payload) =>
            apiRequest<ApiResponse<ChangePasswordResponse>>(
                "/api/auth/employee/change-password",
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["employee", "me"],
            });

            queryClient.invalidateQueries({
                queryKey: ["employees"],
            });
        },
    });
}

/* -------------------------------------------------------------------------- */
/*                              Logout                                        */
/* -------------------------------------------------------------------------- */

export function useEmployeeLogout() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse, Error, void>({
        mutationFn: () =>
            apiRequest<ApiResponse>("/api/auth/employee/logout", {
                method: "POST",
            }),

        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: ["employee"],
            });
        },
    });
}

/* -------------------------------------------------------------------------- */
/*                         Forgot Password                                    */
/* -------------------------------------------------------------------------- */

export function useEmployeeForgotPassword() {
    return useMutation<
        ApiResponse,
        Error,
        {
            employeeId: string;
        }
    >({
        mutationFn: (payload) =>
            apiRequest<ApiResponse>("/api/auth/employee/forgot-password", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
    });
}

/* -------------------------------------------------------------------------- */
/*                           Reset Password                                   */
/* -------------------------------------------------------------------------- */

export function useEmployeeResetPassword() {
    return useMutation<
        ApiResponse,
        Error,
        {
            employeeId: string;
            otp: string;
            newPassword: string;
        }
    >({
        mutationFn: (payload) =>
            apiRequest<ApiResponse>("/api/auth/employee/reset-password", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
    });
}

/* -------------------------------------------------------------------------- */
/*                         Update Employee                                    */
/* -------------------------------------------------------------------------- */

export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse<EmployeeDetailsResponse>,
        Error,
        {
            employeeId: string;
            fullName?: string;
            email?: string;
            phoneNumber?: string;
            department?: string;
            designation?: string;
        }
    >({
        mutationFn: ({ employeeId, ...payload }) =>
            apiRequest<ApiResponse<EmployeeDetailsResponse>>(
                `/api/auth/employee/${employeeId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["employees"],
            });

            queryClient.invalidateQueries({
                queryKey: ["employee", variables.employeeId],
            });
        },
    });
}

/* -------------------------------------------------------------------------- */
/*                       Activate / Deactivate Employee                      */
/* -------------------------------------------------------------------------- */

export function useUpdateEmployeeStatus() {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse,
        Error,
        {
            employeeId: string;
            isActive: boolean;
        }
    >({
        mutationFn: ({ employeeId, isActive }) =>
            apiRequest<ApiResponse>(`/api/auth/employee/${employeeId}/status`, {
                method: "PATCH",
                body: JSON.stringify({
                    isActive,
                }),
            }),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["employees"],
            });

            queryClient.invalidateQueries({
                queryKey: ["employee", variables.employeeId],
            });
        },
    });
}

/* -------------------------------------------------------------------------- */
/*                         Resend Invitation                                  */
/* -------------------------------------------------------------------------- */

export function useResendEmployeeInvitation() {
    return useMutation<
        ApiResponse,
        Error,
        {
            employeeId: string;
        }
    >({
        mutationFn: ({ employeeId }) =>
            apiRequest<ApiResponse>(
                `/api/auth/employee/${employeeId}/resend-invitation`,
                {
                    method: "POST",
                },
            ),
    });
}
