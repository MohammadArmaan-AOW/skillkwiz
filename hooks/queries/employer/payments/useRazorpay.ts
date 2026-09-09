"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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
    message?: string;

    order: {
        id: string;
        amount: number;
        currency: string;
    };

    payment: {
        id: string;
        credits: number;
        amount: number;
        currency: string;
        status?: string;
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
            /*
             * Razorpay verification may update the employer's
             * payment-method authorization on the backend.
             *
             * Therefore refresh the unified payment-method query.
             */
            await queryClient.invalidateQueries({
                queryKey: [
                    "employer",
                    "payments",
                    "payment-method",
                ],
            });

            /*
             * Keep existing broader payment/profile invalidations
             * so existing UI continues to update correctly.
             */
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
        /* -------------------------- Create order -------------------------- */

        createOrder: createOrderMutation.mutateAsync,

        isCreatingOrder: createOrderMutation.isPending,

        createOrderError: createOrderMutation.error,

        createOrderSuccess: createOrderMutation.isSuccess,

        createOrderResponse: createOrderMutation.data,

        resetCreateOrder: createOrderMutation.reset,

        /* -------------------------- Verify payment ------------------------ */

        verifyPayment: verifyPaymentMutation.mutateAsync,

        isVerifyingPayment: verifyPaymentMutation.isPending,

        verifyPaymentError: verifyPaymentMutation.error,

        verifyPaymentSuccess: verifyPaymentMutation.isSuccess,

        verifyPaymentResponse: verifyPaymentMutation.data,

        resetVerifyPayment: verifyPaymentMutation.reset,
    };
}