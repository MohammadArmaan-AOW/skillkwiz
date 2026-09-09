"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type CreatePayPalOrderData = {
    credits: number;
};

export type CreatePayPalOrderResponse = {
    success: boolean;
    message?: string;

    order: {
        id: string;
        status: string;
    };

    payment: {
        id: string;
        credits: number;
        amount: number;
        currency: string;
        status?: string;
    };

    approvalUrl: string | null;
};

export type CapturePayPalOrderData = {
    orderId: string;
};

export type CapturePayPalOrderResponse = {
    success: boolean;
    message: string;

    payment: {
        id: string;
        provider: "paypal";
        providerOrderId: string;
        providerPaymentId?: string;
        status: string;
        creditsPurchased: number;
        amount: number;
        currency: string;
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

async function createPayPalOrder(
    data: CreatePayPalOrderData,
): Promise<CreatePayPalOrderResponse> {
    const response = await axios.post<CreatePayPalOrderResponse>(
        "/api/employer/payments/paypal/create-order",
        data,
        {
            withCredentials: true,
        },
    );

    return response.data;
}

async function capturePayPalOrder(
    data: CapturePayPalOrderData,
): Promise<CapturePayPalOrderResponse> {
    const response = await axios.post<CapturePayPalOrderResponse>(
        "/api/employer/payments/paypal/capture-order",
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

export function usePaypal() {
    const queryClient = useQueryClient();

    /* -------------------------- Create Order ------------------------------ */

    const createOrderMutation = useMutation<
        CreatePayPalOrderResponse,
        ApiError,
        CreatePayPalOrderData
    >({
        mutationFn: async (data) => {
            try {
                return await createPayPalOrder(data);
            } catch (error) {
                throw getApiError(error);
            }
        },
    });

    /* -------------------------- Capture Order ----------------------------- */

    const captureOrderMutation = useMutation<
        CapturePayPalOrderResponse,
        ApiError,
        CapturePayPalOrderData
    >({
        mutationFn: async (data) => {
            try {
                return await capturePayPalOrder(data);
            } catch (error) {
                throw getApiError(error);
            }
        },

        onSuccess: async () => {
            /*
             * PayPal capture may update the employer's
             * payment-method authorization on the backend.
             *
             * Refresh the unified payment-method query.
             */
            await queryClient.invalidateQueries({
                queryKey: ["employer", "payments", "payment-method"],
            });

            /*
             * Keep existing broader invalidations.
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

            await queryClient.invalidateQueries({
        queryKey: ["employer", "assessment", "authorization"],
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

        /* -------------------------- Capture order ------------------------- */

        captureOrder: captureOrderMutation.mutateAsync,

        isCapturingOrder: captureOrderMutation.isPending,

        captureOrderError: captureOrderMutation.error,

        captureOrderSuccess: captureOrderMutation.isSuccess,

        captureOrderResponse: captureOrderMutation.data,

        resetCaptureOrder: captureOrderMutation.reset,
    };
}
