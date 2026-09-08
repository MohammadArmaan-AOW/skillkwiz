import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import PaymentMethod from "@/lib/db/paymentMethodSchema";

const JWT_SECRET = process.env.JWT_SECRET!;
const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const paymentMethodSchema = z.object({
    razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required."),

    razorpayCardId: z.string().min(1, "Razorpay card ID is required."),

    brand: z.string().trim().min(1, "Card brand is required."),

    last4: z.string().trim().length(4, "Invalid card last four digits."),

    expiryMonth: z.number().int().min(1).max(12).optional(),

    expiryYear: z.number().int().optional(),

    cardholderName: z.string().trim().max(300).optional(),
});

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(EMPLOYER_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    authorized: false,
                    paymentMethod: null,
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
                    authorized: false,
                    paymentMethod: null,
                    message: "Invalid or expired session.",
                },
                { status: 401 },
            );
        }

        if (!payload.employerId || !payload.email) {
            return NextResponse.json(
                {
                    success: false,
                    authorized: false,
                    paymentMethod: null,
                    message: "Invalid employer session.",
                },
                { status: 401 },
            );
        }

        await connectDB();

        const paymentMethod = await PaymentMethod.findOne({
            employerId: payload.employerId,
            provider: "razorpay",
            status: "active",
            verified: true,
        }).lean();

        if (!paymentMethod) {
            return NextResponse.json({
                success: true,
                authorized: false,
                paymentMethod: null,
            });
        }

        return NextResponse.json({
            success: true,
            authorized: true,
            paymentMethod: {
                id: paymentMethod._id.toString(),
                provider: paymentMethod.provider,
                type: paymentMethod.type,
                status: paymentMethod.status,
                verified: paymentMethod.verified,
                card: paymentMethod.card,
            },
        });
    } catch (error) {
        console.error("Get Razorpay payment method error:", error);

        return NextResponse.json(
            {
                success: false,
                authorized: false,
                paymentMethod: null,
                message: "Failed to fetch payment method.",
            },
            { status: 500 },
        );
    }
}

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

        const parsed = paymentMethodSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment method data.",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const {
            razorpayPaymentId,
            razorpayCardId,
            brand,
            last4,
            expiryMonth,
            expiryYear,
            cardholderName,
        } = parsed.data;

        await connectDB();

        /*
         * Make sure this Razorpay payment actually
         * belongs to this employer.
         */
        const Payment = (await import("@/lib/db/paymentSchema")).default;

        const payment = await Payment.findOne({
            employerId: payload.employerId,
            provider: "razorpay",
            providerPaymentId: razorpayPaymentId,
            status: "paid",
        });

        if (!payment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A verified Razorpay payment could not be found.",
                },
                { status: 400 },
            );
        }

        const paymentMethod = await PaymentMethod.findOneAndUpdate(
            {
                employerId: payload.employerId,
                provider: "razorpay",
            },
            {
                employerId: payload.employerId,
                provider: "razorpay",
                type: "card",
                status: "active",
                verified: true,
                providerPaymentMethodId: razorpayCardId,
                card: {
                    brand,
                    last4,
                    expiryMonth,
                    expiryYear,
                    cardholderName,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            },
        );

        return NextResponse.json({
            success: true,
            message: "Razorpay payment method saved successfully.",
            paymentMethod: {
                id: paymentMethod._id.toString(),
                provider: paymentMethod.provider,
                type: paymentMethod.type,
                status: paymentMethod.status,
                verified: paymentMethod.verified,
                card: paymentMethod.card,
            },
        });
    } catch (error) {
        console.error("Save Razorpay payment method error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to save payment method.",
            },
            { status: 500 },
        );
    }
}
