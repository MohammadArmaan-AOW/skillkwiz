import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { connectDB } from "@/lib/db/db";
import Payment from "@/lib/db/paymentSchema";
import Employer from "@/lib/db/employerSchema";

const JWT_SECRET = process.env.JWT_SECRET!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_SECRET_KEY!;

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

        const parsed = verifyPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment verification data.",
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
                payment,
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        const isValidSignature = crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(razorpaySignature),
        );

        if (!isValidSignature) {
            payment.status = "failed";
            payment.providerPaymentId = razorpayPaymentId;

            await payment.save();

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Razorpay payment signature.",
                },
                { status: 400 },
            );
        }

        payment.providerPaymentId = razorpayPaymentId;

        payment.status = "paid";
        payment.paidAt = new Date();

        if (!payment.creditsGranted) {
            console.log("========== CREDIT GRANT START ==========");

            console.log("Employer ID:", payload.employerId);
            console.log("Credits to add:", payment.creditsPurchased);

            const employerBefore = await Employer.findById(
                payload.employerId,
            ).lean();

            console.log("Employer BEFORE credit update:", employerBefore);

            if (!employerBefore) {
                console.error("Employer NOT FOUND:", payload.employerId);

                return NextResponse.json(
                    {
                        success: false,
                        message: "Employer not found.",
                    },
                    { status: 404 },
                );
            }

            const updatedEmployer = await Employer.findByIdAndUpdate(
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

            console.log("Employer AFTER credit update:", updatedEmployer);

            if (!updatedEmployer) {
                console.error(
                    "Employer update returned null:",
                    payload.employerId,
                );

                return NextResponse.json(
                    {
                        success: false,
                        message: "Unable to update employer credits.",
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
            message: "Payment verified successfully.",
            payment,
            creditsPurchased: payment.creditsPurchased,
        });
    } catch (error) {
        console.error("Razorpay verification error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to verify Razorpay payment.",
            },
            { status: 500 },
        );
    }
}
