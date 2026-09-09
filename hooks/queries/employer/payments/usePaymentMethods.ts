"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type PaymentProvider = "razorpay" | "paypal";

export type PaymentMethodAuthorization = {
    authorized: boolean;
    authorizedAt: string | null;
};

export type PaymentMethods = {
    razorpay: PaymentMethodAuthorization;
    paypal: PaymentMethodAuthorization;
};

export type PaymentMethodsResponse = {
    success: boolean;
    paymentMethods: PaymentMethods;
    authorizedToPay: boolean;
    message?: string;
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
/*                              API Function                                  */
/* -------------------------------------------------------------------------- */

async function fetchPaymentMethods(): Promise<PaymentMethodsResponse> {
    const response = await axios.get<PaymentMethodsResponse>(
        "/api/employer/payments/payment-method",
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

export function usePaymentMethods() {
    const paymentMethodsQuery = useQuery<PaymentMethodsResponse, ApiError>({
        queryKey: ["employer", "payments", "payment-method"],

        queryFn: async () => {
            try {
                return await fetchPaymentMethods();
            } catch (error) {
                throw getApiError(error);
            }
        },

        retry: false,

        refetchOnWindowFocus: false,

        staleTime: 5 * 60 * 1000,
    });

    const paymentMethods = paymentMethodsQuery.data?.paymentMethods;

    return {
        /* -------------------------- Full response ------------------------- */

        paymentMethods: paymentMethods ?? null,

        paymentMethodResponse: paymentMethodsQuery.data,

        /* -------------------------- Razorpay ------------------------------ */

        razorpayAuthorized: paymentMethods?.razorpay.authorized ?? false,

        razorpayAuthorizedAt: paymentMethods?.razorpay.authorizedAt ?? null,

        /* -------------------------- PayPal -------------------------------- */

        paypalAuthorized: paymentMethods?.paypal.authorized ?? false,

        paypalAuthorizedAt: paymentMethods?.paypal.authorizedAt ?? null,

        /* -------------------------- General -------------------------------- */

        authorizedToPay: paymentMethodsQuery.data?.authorizedToPay ?? false,

        isLoadingPaymentMethods: paymentMethodsQuery.isPending,

        isFetchingPaymentMethods: paymentMethodsQuery.isFetching,

        isPaymentMethodsError: paymentMethodsQuery.isError,

        paymentMethodsError: paymentMethodsQuery.error,

        refetchPaymentMethods: paymentMethodsQuery.refetch,
    };
}
