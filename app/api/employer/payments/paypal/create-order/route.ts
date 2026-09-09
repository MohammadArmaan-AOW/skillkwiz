// Paypal - Create Order

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
        // ------------------------------------------------------------------
        // Authentication
        // ------------------------------------------------------------------

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

        // ------------------------------------------------------------------
        // Validate request
        // ------------------------------------------------------------------

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

        // ------------------------------------------------------------------
        // Database
        // ------------------------------------------------------------------

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

        // ------------------------------------------------------------------
        // Pricing
        // ------------------------------------------------------------------

        /*
         * TEMPORARY TEST PRICING
         *
         * Replace with the final SkillKwiz
         * credit pricing configuration.
         */
        const pricePerCredit = 1;

        const amount = credits * pricePerCredit;
        const formattedAmount = amount.toFixed(2);

        // ------------------------------------------------------------------
        // PayPal authentication
        // ------------------------------------------------------------------

        const accessToken = await getPayPalAccessToken();

        // ------------------------------------------------------------------
        // Create PayPal order
        // ------------------------------------------------------------------

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

                    application_context: {
                        brand_name: "SkillKwiz",
                        user_action: "PAY_NOW",

                        return_url: `${request.nextUrl.origin}/services/employer/profile`,

                        cancel_url: `${request.nextUrl.origin}/services/employer/profile`,
                    },
                }),

                cache: "no-store",
            },
        );

        // ------------------------------------------------------------------
        // Parse PayPal response safely
        // ------------------------------------------------------------------

        const responseText = await paypalResponse.text();

        let paypalData: {
            id?: string;
            status?: string;
            links?: {
                href?: string;
                rel?: string;
                method?: string;
            }[];
        };

        try {
            paypalData = JSON.parse(responseText);
        } catch {
            console.error(
                "PayPal create order returned invalid JSON:",
                responseText,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid response received from PayPal.",
                },
                { status: 502 },
            );
        }

        // ------------------------------------------------------------------
        // Handle PayPal error
        // ------------------------------------------------------------------

        if (!paypalResponse.ok || !paypalData.id) {
            console.error("PayPal create order error:", paypalData);

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to create PayPal order.",
                },
                { status: 502 },
            );
        }

        // ------------------------------------------------------------------
        // Find PayPal approval URL
        // ------------------------------------------------------------------

        const approvalLink = paypalData.links?.find(
            (link) => link.rel === "approve" || link.rel === "payer-action",
        );

        const approvalUrl = approvalLink?.href ?? null;

        console.log("PayPal order created:", paypalData.id);

        console.log("PayPal approval URL:", approvalUrl);

        if (!approvalUrl) {
            console.error(
                "PayPal order did not contain an approval link:",
                paypalData,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "PayPal approval URL was not returned.",
                },
                { status: 502 },
            );
        }

        // ------------------------------------------------------------------
        // Create local payment record
        // ------------------------------------------------------------------

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

        // ------------------------------------------------------------------
        // Response
        // ------------------------------------------------------------------

        return NextResponse.json({
            success: true,

            message: "PayPal order created successfully.",

            order: {
                id: paypalData.id,

                status: paypalData.status ?? "CREATED",

                amount,

                currency: "USD",
            },

            payment: {
                id: payment._id.toString(),

                credits: payment.creditsPurchased,

                amount: payment.amount,

                currency: payment.currency,

                status: payment.status,
            },

            // IMPORTANT:
            // approvalUrl must be at the top level because
            // PaymentDetails uses response.approvalUrl.
            approvalUrl,
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
