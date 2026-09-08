"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type RazorpayPaymentMethod = {
    id: string;
    provider: "razorpay";
    type: "card";
    status: "active" | "inactive" | "failed" | "expired";
    verified: boolean;
    card?: {
        brand?: string;
        last4?: string;
        expiryMonth?: number;
        expiryYear?: number;
        cardholderName?: string;
    } | null;
};

export type RazorpayPaymentMethodResponse = {
    success: boolean;
    authorized: boolean;
    paymentMethod: RazorpayPaymentMethod | null;
    message?: string;
};

export type CreateRazorpayOrderData = {
    credits: number;
};

export type RazorpayOrder = {
    id: string;
    amount: number;
    currency: string;
};

export type CreateRazorpayOrderResponse = {
    success: boolean;
    message: string;
    order: RazorpayOrder;
    payment: {
        id: string;
        credits: number;
        amount: number;
        currency: string;
        status: string;
    };
    razorpayKeyId: string;
};

export type VerifyRazorpayPaymentData = {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
};

export type VerifyRazorpayPaymentResponse = {
    success: boolean;
    message: string;
    payment: {
        id: string;
        status: string;
        creditsPurchased: number;
        amount?: number;
        currency?: string;
    };
};

type ApiErrorResponse = {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
};

export type ApiError = {
    message: string;
    errors?: Record<string, string[]>;
};

/* -------------------------------------------------------------------------- */
/*                              API Functions                                 */
/* -------------------------------------------------------------------------- */

async function fetchRazorpayPaymentMethod(): Promise<RazorpayPaymentMethodResponse> {
    const response = await axios.get<RazorpayPaymentMethodResponse>(
        "/api/employer/payments/razorpay/payment-method",
        {
            withCredentials: true,
        },
    );

    return response.data;
}

async function createRazorpayOrder(
    data: CreateRazorpayOrderData,
): Promise<CreateRazorpayOrderResponse> {
    const response = await axios.post<CreateRazorpayOrderResponse>(
        "/api/employer/payments/razorpay/create-order",
        data,
        {
            withCredentials: true,
        },
    );

    return response.data;
}

async function verifyRazorpayPayment(
    data: VerifyRazorpayPaymentData,
): Promise<VerifyRazorpayPaymentResponse> {
    const response = await axios.post<VerifyRazorpayPaymentResponse>(
        "/api/employer/payments/razorpay/verify",
        data,
        {
            withCredentials: true,
        },
    );

    return response.data;
}

/* -------------------------------------------------------------------------- */
/*                              Error Handler                                 */
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
        message: "Something went wrong. Please try again.",
    };
}

/* -------------------------------------------------------------------------- */
/*                               Main Hook                                    */
/* -------------------------------------------------------------------------- */

export function useRazorpay() {
    const queryClient = useQueryClient();

    /* ------------------------- Payment Method Query ----------------------- */

    const paymentMethodQuery = useQuery<
        RazorpayPaymentMethodResponse,
        ApiError
    >({
        queryKey: ["employer", "payments", "razorpay", "payment-method"],

        queryFn: async () => {
            try {
                return await fetchRazorpayPaymentMethod();
            } catch (error) {
                throw getApiError(error);
            }
        },

        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });

    /* -------------------------- Create Order ------------------------------ */

    const createOrderMutation = useMutation<
        CreateRazorpayOrderResponse,
        ApiError,
        CreateRazorpayOrderData
    >({
        mutationFn: async (data) => {
            try {
                return await createRazorpayOrder(data);
            } catch (error) {
                throw getApiError(error);
            }
        },
    });

    /* -------------------------- Verify Payment ---------------------------- */

    const verifyPaymentMutation = useMutation<
        VerifyRazorpayPaymentResponse,
        ApiError,
        VerifyRazorpayPaymentData
    >({
        mutationFn: async (data) => {
            try {
                return await verifyRazorpayPayment(data);
            } catch (error) {
                throw getApiError(error);
            }
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [
                    "employer",
                    "payments",
                    "razorpay",
                    "payment-method",
                ],
            });

            await queryClient.invalidateQueries({
                queryKey: ["employer", "payments"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["employer", "me"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["employer", "profile"],
            });
        },
    });

    /* ---------------------------------------------------------------------- */
    /*                                  Return                                */
    /* ---------------------------------------------------------------------- */

    return {
        /* Payment method */
        paymentMethod: paymentMethodQuery.data?.paymentMethod ?? null,

        isAuthorized: paymentMethodQuery.data?.authorized ?? false,

        paymentMethodResponse: paymentMethodQuery.data,

        isLoadingPaymentMethod: paymentMethodQuery.isPending,

        isFetchingPaymentMethod: paymentMethodQuery.isFetching,

        isPaymentMethodError: paymentMethodQuery.isError,

        paymentMethodError: paymentMethodQuery.error,

        refetchPaymentMethod: paymentMethodQuery.refetch,

        /* Create order */
        createOrder: createOrderMutation.mutateAsync,

        isCreatingOrder: createOrderMutation.isPending,

        createOrderError: createOrderMutation.error,

        createOrderSuccess: createOrderMutation.isSuccess,

        createOrderResponse: createOrderMutation.data,

        resetCreateOrder: createOrderMutation.reset,

        /* Verify payment */
        verifyPayment: verifyPaymentMutation.mutateAsync,

        isVerifyingPayment: verifyPaymentMutation.isPending,

        verifyPaymentError: verifyPaymentMutation.error,

        verifyPaymentSuccess: verifyPaymentMutation.isSuccess,

        verifyPaymentResponse: verifyPaymentMutation.data,

        resetVerifyPayment: verifyPaymentMutation.reset,
    };
}
