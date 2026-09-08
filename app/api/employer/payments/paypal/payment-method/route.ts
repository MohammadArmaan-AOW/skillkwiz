import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db/db";
import PaymentMethod from "@/lib/db/paymentMethodSchema";

const JWT_SECRET = process.env.JWT_SECRET!;
const EMPLOYER_TOKEN_COOKIE = "skillkwiz_employer_token";

type EmployerTokenPayload = {
    employerId: string;
    email: string;
    authProvider?: "email" | "google";
};

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
            provider: "paypal",
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
                card: paymentMethod.card ?? null,
            },
        });
    } catch (error) {
        console.error("Get PayPal payment method error:", error);

        return NextResponse.json(
            {
                success: false,
                authorized: false,
                paymentMethod: null,
                message: "Failed to fetch PayPal payment method.",
            },
            { status: 500 },
        );
    }
}
