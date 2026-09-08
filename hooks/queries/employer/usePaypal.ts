"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type PayPalPaymentMethod = {
    id: string;
    provider: "paypal";
    type: "paypal" | "card";
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

export type PayPalPaymentMethodResponse = {
    success: boolean;
    authorized: boolean;
    paymentMethod: PayPalPaymentMethod | null;
    message?: string;
};

export type CreatePayPalOrderData = {
    credits: number;
};

export type CreatePayPalOrderResponse = {
    success: boolean;
    message: string;
    order: {
        id: string;
        status: string;
        amount: number;
        currency: string;
        approvalUrl: string | null;
    };
    payment: {
        id: string;
        credits: number;
        amount: number;
        currency: string;
        status: string;
    };
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

async function fetchPayPalPaymentMethod(): Promise<PayPalPaymentMethodResponse> {
    const response = await axios.get<PayPalPaymentMethodResponse>(
        "/api/employer/payments/paypal/payment-method",
        {
            withCredentials: true,
        },
    );

    return response.data;
}

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

    /* ------------------------- Payment Method Query ----------------------- */

    const paymentMethodQuery = useQuery<PayPalPaymentMethodResponse, ApiError>({
        queryKey: ["employer", "payments", "paypal", "payment-method"],

        queryFn: async () => {
            try {
                return await fetchPayPalPaymentMethod();
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
            await queryClient.invalidateQueries({
                queryKey: ["employer", "payments", "paypal", "payment-method"],
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

        /* Capture order */
        captureOrder: captureOrderMutation.mutateAsync,

        isCapturingOrder: captureOrderMutation.isPending,

        captureOrderError: captureOrderMutation.error,

        captureOrderSuccess: captureOrderMutation.isSuccess,

        captureOrderResponse: captureOrderMutation.data,

        resetCaptureOrder: captureOrderMutation.reset,
    };
}
