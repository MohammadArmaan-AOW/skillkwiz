import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Payment from "@/lib/db/paymentSchema";
import { getPayPalAccessToken, PAYPAL_BASE_URL } from "@/lib/payments/paypal";

const JWT_SECRET = process.env.JWT_SECRET!;
const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const captureOrderSchema = z.object({
    orderId: z.string().min(1, "PayPal order ID is required."),
});

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(EMPLOYER_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required.",
                },
                { status: 401 },
            );
        }

        let payload: EmployerTokenPayload;

        try {
            payload = jwt.verify(
                token,
                JWT_SECRET,
            ) as unknown as EmployerTokenPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired session.",
                },
                { status: 401 },
            );
        }

        if (!payload.employerId || !payload.email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid employer session.",
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
                    message: "Invalid PayPal order.",
                    errors: parsed.error.flatten().fieldErrors,
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

        if (payment.status === "paid") {
            return NextResponse.json({
                success: true,
                message: "Payment already captured.",
                payment: {
                    id: payment._id.toString(),
                    status: payment.status,
                    creditsPurchased: payment.creditsPurchased,
                },
            });
        }

        const accessToken = await getPayPalAccessToken();

        const captureResponse = await fetch(
            `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
                orderId,
            )}/capture`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "PayPal-Request-Id": `capture-${payment._id.toString()}`,
                },
                body: JSON.stringify({}),
                cache: "no-store",
            },
        );

        const captureData = await captureResponse.json();

        if (!captureResponse.ok) {
            console.error("PayPal capture error:", captureData);

            payment.status = "failed";

            await payment.save();

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to capture PayPal payment.",
                },
                { status: 502 },
            );
        }

        if (captureData.status !== "COMPLETED") {
            return NextResponse.json(
                {
                    success: false,
                    message: "PayPal payment was not completed.",
                    status: captureData.status,
                },
                { status: 400 },
            );
        }

        const capture =
            captureData.purchase_units?.[0]?.payments?.captures?.[0];

        payment.providerPaymentId = capture?.id;

        payment.status = "paid";
        payment.paidAt = new Date();

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
        });
    } catch (error) {
        console.error("Capture PayPal order error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to capture PayPal payment.",
            },
            { status: 500 },
        );
    }
}
