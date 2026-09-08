import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Payment from "@/lib/db/paymentSchema";

const JWT_SECRET = process.env.JWT_SECRET!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
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

        const parsed = verifyPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment verification data.",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
            parsed.data;

        await connectDB();

        const payment = await Payment.findOne({
            employerId: payload.employerId,
            provider: "razorpay",
            providerOrderId: razorpayOrderId,
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
                message: "Payment already verified.",
                payment: {
                    id: payment._id.toString(),
                    status: payment.status,
                    creditsPurchased: payment.creditsPurchased,
                },
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        const signaturesMatch = generatedSignature === razorpaySignature;

        if (!signaturesMatch) {
            payment.status = "failed";
            payment.providerPaymentId = razorpayPaymentId;

            await payment.save();

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment signature.",
                },
                { status: 400 },
            );
        }

        payment.providerPaymentId = razorpayPaymentId;

        payment.status = "paid";
        payment.paidAt = new Date();

        await payment.save();

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully.",
            payment: {
                id: payment._id.toString(),
                status: payment.status,
                creditsPurchased: payment.creditsPurchased,
                amount: payment.amount,
                currency: payment.currency,
            },
        });
    } catch (error) {
        console.error("Verify Razorpay payment error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to verify payment.",
            },
            { status: 500 },
        );
    }
}
