import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Payment from "@/lib/db/paymentSchema";
import Employer from "@/lib/db/employerSchema";
import { getPayPalAccessToken, PAYPAL_BASE_URL } from "@/lib/payments/paypal";

const JWT_SECRET = process.env.JWT_SECRET!;

const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const captureOrderSchema = z.object({
    orderId: z.string().min(1),
});

type PayPalCaptureResponse = {
    id?: string;
    status?: string;
    message?: string;
    name?: string;
    details?: Array<{
        issue?: string;
        description?: string;
    }>;
    purchase_units?: Array<{
        payments?: {
            captures?: Array<{
                id?: string;
                status?: string;
                amount?: {
                    value?: string;
                    currency_code?: string;
                };
            }>;
        };
    }>;
};

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(EMPLOYER_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                { status: 401 },
            );
        }

        let payload: EmployerTokenPayload;

        try {
            payload = jwt.verify(token, JWT_SECRET) as EmployerTokenPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired authentication token.",
                },
                { status: 401 },
            );
        }

        if (!payload.employerId || !payload.email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid employer authentication.",
                },
                { status: 401 },
            );
        }

        const body = await request.json();

        const parsed = captureOrderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid PayPal order ID.",
                },
                { status: 400 },
            );
        }

        const { orderId } = parsed.data;

        await connectDB();

        const payment = await Payment.findOne({
            employerId: payload.employerId,
            provider: "paypal",
            providerOrderId: orderId,
        });

        if (!payment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment record not found.",
                },
                { status: 404 },
            );
        }

        /*
         * Idempotency:
         * If this payment was already captured and
         * credits were already granted, don't grant
         * them again.
         */
        if (payment.status === "paid" && payment.creditsGranted) {
            return NextResponse.json({
                success: true,
                message: "Payment already captured.",
                payment,
                creditsPurchased: payment.creditsPurchased,
            });
        }

        const accessToken = await getPayPalAccessToken();

        const response = await fetch(
            `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "PayPal-Request-Id": `capture_${orderId}`,
                },
                body: JSON.stringify({}),
                cache: "no-store",
            },
        );

        /*
         * IMPORTANT:
         * Do not call response.json() directly.
         *
         * PayPal can sometimes return an empty response body.
         * Reading text first prevents:
         *
         * SyntaxError: Unexpected end of JSON input
         */
        const responseText = await response.text();

        let captureData: PayPalCaptureResponse = {};

        if (responseText.trim()) {
            try {
                captureData = JSON.parse(responseText) as PayPalCaptureResponse;
            } catch (parseError) {
                console.error("Unable to parse PayPal capture response:", {
                    status: response.status,
                    statusText: response.statusText,
                    responseText,
                    parseError,
                });

                return NextResponse.json(
                    {
                        success: false,
                        message: "PayPal returned an invalid capture response.",
                    },
                    { status: 502 },
                );
            }
        }

        console.log("PayPal capture response:", {
            status: response.status,
            statusText: response.statusText,
            captureData,
        });

        /*
         * PayPal capture failed.
         */
        if (!response.ok) {
            console.error("PayPal capture failed:", {
                status: response.status,
                statusText: response.statusText,
                captureData,
                responseText,
            });

            /*
             * If PayPal says the order has already been captured,
             * don't immediately mark our payment as failed.
             *
             * We will attempt to retrieve the order details below.
             */
            const alreadyCaptured =
                captureData.name === "ORDER_ALREADY_CAPTURED" ||
                captureData.message?.toLowerCase().includes("already captured");

            if (!alreadyCaptured) {
                if (payment.status !== "paid") {
                    payment.status = "failed";
                    await payment.save();
                }

                return NextResponse.json(
                    {
                        success: false,
                        message:
                            captureData.message ??
                            captureData.details?.[0]?.description ??
                            "PayPal payment capture failed.",
                    },
                    { status: 400 },
                );
            }
        }

        /*
         * If PayPal returned an empty body or told us the order
         * was already captured, retrieve the order directly.
         *
         * PayPal's Show Order Details endpoint can be used to
         * verify that an order is COMPLETED and contains a
         * completed capture.
         */
        if (!captureData.status || captureData.status !== "COMPLETED") {
            const orderResponse = await fetch(
                `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                },
            );

            const orderResponseText = await orderResponse.text();

            let orderData: PayPalCaptureResponse = {};

            if (orderResponseText.trim()) {
                try {
                    orderData = JSON.parse(
                        orderResponseText,
                    ) as PayPalCaptureResponse;
                } catch (parseError) {
                    console.error("Unable to parse PayPal order response:", {
                        status: orderResponse.status,
                        responseText: orderResponseText,
                        parseError,
                    });
                }
            }

            if (!orderResponse.ok) {
                console.error("PayPal order lookup failed:", {
                    status: orderResponse.status,
                    orderData,
                    responseText: orderResponseText,
                });

                if (payment.status !== "paid") {
                    payment.status = "failed";
                    await payment.save();
                }

                return NextResponse.json(
                    {
                        success: false,
                        message: "Unable to verify PayPal payment status.",
                    },
                    { status: 400 },
                );
            }

            captureData = orderData;
        }

        /*
         * The order must be COMPLETED before credits are granted.
         */
        if (captureData.status !== "COMPLETED") {
            payment.status = "failed";
            await payment.save();

            return NextResponse.json(
                {
                    success: false,
                    message: "PayPal payment was not completed.",
                },
                { status: 400 },
            );
        }

        /*
         * Find the actual PayPal capture.
         */
        const capture =
            captureData.purchase_units?.[0]?.payments?.captures?.[0];

        if (!capture?.id) {
            console.error("PayPal capture reference missing:", captureData);

            payment.status = "failed";
            await payment.save();

            return NextResponse.json(
                {
                    success: false,
                    message: "PayPal capture reference was not found.",
                },
                { status: 400 },
            );
        }

        /*
         * Verify captured amount and currency against
         * our own Payment record before granting credits.
         */
        const capturedAmount = Number(capture.amount?.value);

        const capturedCurrency = capture.amount?.currency_code;

        if (
            !Number.isFinite(capturedAmount) ||
            capturedAmount !== payment.amount ||
            capturedCurrency !== payment.currency
        ) {
            console.error("PayPal capture amount mismatch:", {
                expectedAmount: payment.amount,
                capturedAmount,
                expectedCurrency: payment.currency,
                capturedCurrency,
                orderId,
            });

            payment.status = "failed";
            await payment.save();

            return NextResponse.json(
                {
                    success: false,
                    message: "PayPal payment amount could not be verified.",
                },
                { status: 400 },
            );
        }

        /*
         * Payment is verified.
         */
        payment.providerPaymentId = capture.id;
        payment.status = "paid";
        payment.paidAt = new Date();

        /*
         * Grant credits exactly once.
         */
        if (!payment.creditsGranted) {
    console.log("========== CREDIT GRANT START ==========");

    console.log("Employer ID:", payload.employerId);
    console.log(
        "Credits to add:",
        payment.creditsPurchased,
    );

    const employerBefore = await Employer.findById(
        payload.employerId,
    ).lean();

    console.log(
        "Employer BEFORE credit update:",
        employerBefore,
    );

    if (!employerBefore) {
        console.error(
            "Employer NOT FOUND:",
            payload.employerId,
        );

        return NextResponse.json(
            {
                success: false,
                message: "Employer not found.",
            },
            { status: 404 },
        );
    }

    const updatedEmployer =
        await Employer.findByIdAndUpdate(
            payload.employerId,
            {
                $inc: {
                    credits: payment.creditsPurchased,
                },
            },
            {
                new: true,
            },
        );

    console.log(
        "Employer AFTER credit update:",
        updatedEmployer,
    );

    if (!updatedEmployer) {
        console.error(
            "Employer update returned null:",
            payload.employerId,
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to update employer credits.",
            },
            { status: 500 },
        );
    }

    payment.creditsGranted = true;

    console.log("========== CREDIT GRANT COMPLETE ==========");
}
        await payment.save();

        return NextResponse.json({
            success: true,
            message: "PayPal payment captured successfully.",
            payment: {
                id: payment._id.toString(),
                provider: payment.provider,
                providerOrderId: payment.providerOrderId,
                providerPaymentId: payment.providerPaymentId,
                status: payment.status,
                creditsPurchased: payment.creditsPurchased,
                amount: payment.amount,
                currency: payment.currency,
            },
            creditsPurchased: payment.creditsPurchased,
        });
    } catch (error) {
        console.error("PayPal capture error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to capture PayPal payment.",
            },
            { status: 500 },
        );
    }
}
