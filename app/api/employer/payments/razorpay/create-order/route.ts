import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";
import Payment from "@/lib/db/paymentSchema";
import { razorpay } from "@/lib/payments/razorpay";
import { getCreditPrice } from "@/lib/payments/creditPricing";

const JWT_SECRET = process.env.JWT_SECRET!;
const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const createOrderSchema = z.object({
    credits: z
        .number()
        .int()
        .min(1, "At least 1 credit is required."),
});

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(
            EMPLOYER_TOKEN_COOKIE,
        )?.value;

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
            payload = jwt.verify(
                token,
                JWT_SECRET,
            ) as EmployerTokenPayload;
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

        const parsed = createOrderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        parsed.error.issues[0]?.message ??
                        "Invalid request.",
                },
                { status: 400 },
            );
        }

        const { credits } = parsed.data;

        await connectDB();

        const employer = await Employer.findById(
            payload.employerId,
        );

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employer not found.",
                },
                { status: 404 },
            );
        }

        const amount = getCreditPrice(
            "razorpay",
            credits,
        );

        const amountInPaise = amount * 100;

        const receipt = `credit_${payload.employerId}_${Date.now()}`;

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt,
        });

        const payment = await Payment.create({
            employerId: employer._id,
            provider: "razorpay",
            providerOrderId: order.id,
            amount,
            currency: "INR",
            status: "created",
            purpose: "credit_purchase",
            creditsPurchased: credits,
        });

        return NextResponse.json({
            success: true,

            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },

            payment: {
                id: payment._id,
                credits,
                amount,
                currency: "INR",
            },

            razorpayKeyId: process.env.RAZORPAY_API_KEY,
        });
    } catch (error) {
        console.error(
            "Razorpay create order error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create Razorpay order.",
            },
            { status: 500 },
        );
    }
}