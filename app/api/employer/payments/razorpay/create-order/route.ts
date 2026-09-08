import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";
import Payment from "@/lib/db/paymentSchema";
import { razorpay } from "@/lib/payments/razorpay";

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
         * Replace this with the final SkillKwiz pricing
         * configuration once the credit price is finalized.
         *
         * Example:
         * 1 credit = ₹10
         */
        const pricePerCredit = 10;

        const amount = credits * pricePerCredit;

        const amountInPaise = Math.round(amount * 100);

        const receipt = `skw_${Date.now()}`;

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt,
        });

        const payment = await Payment.create({
            employerId: employer._id,
            provider: "razorpay",
            providerOrderId: razorpayOrder.id,
            amount,
            currency: "INR",
            status: "created",
            purpose: "credit_purchase",
            creditsPurchased: credits,
        });

        return NextResponse.json({
            success: true,
            message: "Razorpay order created successfully.",
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            },
            payment: {
                id: payment._id.toString(),
                credits: payment.creditsPurchased,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
            },
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Create Razorpay order error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create Razorpay order.",
            },
            { status: 500 },
        );
    }
}
