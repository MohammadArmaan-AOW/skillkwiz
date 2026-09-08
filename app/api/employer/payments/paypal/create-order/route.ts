import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";
import Payment from "@/lib/db/paymentSchema";
import { getPayPalAccessToken, PAYPAL_BASE_URL } from "@/lib/payments/paypal";

const JWT_SECRET = process.env.JWT_SECRET!;
const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const createOrderSchema = z.object({
    credits: z.number().int().min(1, "At least 1 credit is required."),
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

        const parsed = createOrderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment request.",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { credits } = parsed.data;

        await connectDB();

        const employer = await Employer.findById(payload.employerId);

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employer not found.",
                },
                { status: 404 },
            );
        }

        /*
         * TEMPORARY TEST PRICING
         *
         * Replace with the final SkillKwiz
         * credit pricing configuration.
         */
        const pricePerCredit = 10;

        const amount = credits * pricePerCredit;

        const formattedAmount = amount.toFixed(2);

        const accessToken = await getPayPalAccessToken();

        const paypalResponse = await fetch(
            `${PAYPAL_BASE_URL}/v2/checkout/orders`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "PayPal-Request-Id": `skw-${payload.employerId}-${Date.now()}`,
                },
                body: JSON.stringify({
                    intent: "CAPTURE",

                    purchase_units: [
                        {
                            reference_id: `credits-${credits}`,
                            description: `SkillKwiz ${credits} credits`,
                            custom_id: payload.employerId,

                            amount: {
                                currency_code: "USD",
                                value: formattedAmount,
                            },
                        },
                    ],
                }),
                cache: "no-store",
            },
        );

        const paypalData = await paypalResponse.json();

        if (!paypalResponse.ok) {
            console.error("PayPal create order error:", paypalData);

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to create PayPal order.",
                },
                { status: 502 },
            );
        }

        const payment = await Payment.create({
            employerId: employer._id,

            provider: "paypal",

            providerOrderId: paypalData.id,

            amount,

            currency: "USD",

            status: "created",

            purpose: "credit_purchase",

            creditsPurchased: credits,
        });

        const approvalLink = paypalData.links?.find(
            (link: { href: string; rel: string }) => link.rel === "approve",
        );

        return NextResponse.json({
            success: true,

            message: "PayPal order created successfully.",

            order: {
                id: paypalData.id,
                status: paypalData.status,
                amount,
                currency: "USD",
                approvalUrl: approvalLink?.href ?? null,
            },

            payment: {
                id: payment._id.toString(),
                credits: payment.creditsPurchased,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
            },
        });
    } catch (error) {
        console.error("Create PayPal order error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create PayPal order.",
            },
            { status: 500 },
        );
    }
}
