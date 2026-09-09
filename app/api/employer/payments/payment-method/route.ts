import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";
import { verifyEmployerJwt } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get employer JWT from the existing authentication cookie.
        const token = request.cookies.get("skillkwiz_employer_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        let payload;

        try {
            payload = verifyEmployerJwt(token);
        } catch (error) {
            console.error("Employer JWT verification failed:", error);

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired authentication token.",
                },
                { status: 401 },
            );
        }

        const employer = await Employer.findById(payload.employerId).lean();

        if (!employer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employer not found.",
                },
                { status: 404 },
            );
        }

        /**
         * Normalize the payment methods.
         *
         * Older employer documents may not have paymentMethods,
         * razorpay, or paypal fields yet.
         *
         * Therefore we always return the same response structure.
         */
        const paymentMethods = {
            razorpay: {
                authorized:
                    employer.paymentMethods?.razorpay?.authorized ?? false,
                authorizedAt:
                    employer.paymentMethods?.razorpay?.authorizedAt ?? null,
            },

            paypal: {
                authorized:
                    employer.paymentMethods?.paypal?.authorized ?? false,
                authorizedAt:
                    employer.paymentMethods?.paypal?.authorizedAt ?? null,
            },
        };

        /**
         * Keep authorizedToPay for backward compatibility.
         *
         * New frontend code should use paymentMethods instead.
         *
         * Existing employers may still have authorizedToPay set from
         * the old implementation, so we preserve that value.
         */
        const authorizedToPay =
            employer.authorizedToPay ??
            (paymentMethods.razorpay.authorized ||
                paymentMethods.paypal.authorized);

        return NextResponse.json({
            success: true,

            paymentMethods,

            authorizedToPay,
        });
    } catch (error) {
        console.error("GET Payment Method Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch payment methods.",
            },
            { status: 500 },
        );
    }
}