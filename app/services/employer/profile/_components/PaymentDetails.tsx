"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

import { useRazorpay } from "@/hooks/queries/employer/payments/useRazorpay";
import { usePaypal } from "@/hooks/queries/employer/payments/usePaypal";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const CREDIT_PRICE_INR = 100;
const CREDIT_PRICE_USD = 1;

const CREDIT_OPTIONS = [1, 5, 10, 25, 50, 100];

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PaymentDetails() {
    const [credits, setCredits] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const {
        createOrder: createRazorpayOrder,
        verifyPayment: verifyRazorpayPayment,
    } = useRazorpay();

    const { createOrder: createPaypalOrder } = usePaypal();

    const razorpayAmount = credits * CREDIT_PRICE_INR;

    const paypalAmount = credits * CREDIT_PRICE_USD;

    const searchParams = useSearchParams();
    const router = useRouter();

    const { captureOrder, isCapturingOrder } = usePaypal();

    const paypalCaptureStarted = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            return;
        }

        if (paypalCaptureStarted.current) {
            return;
        }

        paypalCaptureStarted.current = true;

        const verifyPaypalPayment = async () => {
            try {
                const response = await captureOrder({
                    orderId: token,
                });

                if (!response.success) {
                    throw new Error(
                        response.message ??
                            "PayPal payment verification failed.",
                    );
                }

                toast.success("Payment successful!", {
                    description:
                        "Your credits have been added to your account.",
                });

                // Remove token and PayerID from the URL.
                router.replace("/services/employer/profile");
            } catch (error) {
                console.error("PayPal payment verification error:", error);

                toast.error("Payment verification failed", {
                    description:
                        error instanceof Error
                            ? error.message
                            : "We could not verify your PayPal payment.",
                });
            }
        };

        verifyPaypalPayment();
    }, [searchParams, captureOrder, router]);

    const loadRazorpayScript = async (): Promise<boolean> => {
        if (window.Razorpay) {
            return true;
        }

        return new Promise((resolve) => {
            const script = document.createElement("script");

            script.src = "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => resolve(true);

            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async () => {
        try {
            setIsProcessing(true);
            setErrorMessage("");
            setSuccessMessage("");

            const isLoaded = await loadRazorpayScript();

            if (!isLoaded) {
                throw new Error("Unable to load Razorpay checkout.");
            }

            const response = await createRazorpayOrder({
                credits,
            });

            if (!response.success) {
                throw new Error(
                    response.message ?? "Unable to create Razorpay order.",
                );
            }

            if (!response.razorpayKeyId) {
                throw new Error("Razorpay key is not configured.");
            }

            await new Promise<void>((resolve, reject) => {
                const razorpay = new window.Razorpay({
                    key: response.razorpayKeyId,

                    amount: response.order.amount,

                    currency: response.order.currency,

                    name: "SkillKwiz",

                    description: `${credits} SkillKwiz credit${
                        credits === 1 ? "" : "s"
                    }`,

                    order_id: response.order.id,

                    handler: async (paymentResponse: {
                        razorpay_order_id: string;
                        razorpay_payment_id: string;
                        razorpay_signature: string;
                    }) => {
                        try {
                            const verifyResponse = await verifyRazorpayPayment({
                                razorpayOrderId:
                                    paymentResponse.razorpay_order_id,

                                razorpayPaymentId:
                                    paymentResponse.razorpay_payment_id,

                                razorpaySignature:
                                    paymentResponse.razorpay_signature,
                            });

                            if (!verifyResponse.success) {
                                throw new Error(
                                    verifyResponse.message ??
                                        "Payment verification failed.",
                                );
                            }

                            setSuccessMessage(
                                `${credits} credit${
                                    credits === 1 ? "" : "s"
                                } added successfully.`,
                            );

                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },

                    modal: {
                        ondismiss: () => {
                            reject(new Error("Payment was cancelled."));
                        },
                    },
                });

                razorpay.on("payment.failed", (response: any) => {
                    reject(
                        new Error(
                            response?.error?.description ??
                                "Razorpay payment failed.",
                        ),
                    );
                });

                razorpay.open();
            });
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Razorpay payment failed.",
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaypalPayment = async () => {
        try {
            setIsProcessing(true);
            setErrorMessage("");
            setSuccessMessage("");

            const response = await createPaypalOrder({
                credits,
            });

            if (!response.success) {
                throw new Error(
                    response.message ?? "Unable to create PayPal order.",
                );
            }

            if (!response.approvalUrl) {
                throw new Error("PayPal approval URL was not returned.");
            }

            window.location.href = response.approvalUrl;
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "PayPal payment failed.",
            );

            setIsProcessing(false);
        }
    };

    return (
        <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CreditCard className="size-5" />
                </div>

                <div>
                    <h3 className="font-semibold">Buy credits</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Purchase credits to create and assign assessments.
                    </p>
                </div>
            </div>

            <div className="mt-5 space-y-5">
                {/* Credit Selection */}
                <div>
                    <p className="text-sm font-medium">Select credits</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {CREDIT_OPTIONS.map((option) => {
                            const selected = credits === option;

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setCredits(option)}
                                    disabled={isProcessing}
                                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                        selected
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:bg-muted"
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Credits
                        </span>

                        <span className="font-semibold">{credits}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Razorpay
                        </span>

                        <span className="font-semibold">
                            ₹{razorpayAmount.toLocaleString("en-IN")}
                        </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            PayPal
                        </span>

                        <span className="font-semibold">
                            ${paypalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Success */}
                {successMessage && (
                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                        <CheckCircle2 className="size-4 shrink-0" />

                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Error */}
                {errorMessage && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                        {errorMessage}
                    </div>
                )}

                {/* Payment Buttons */}
                <div className="grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={handleRazorpayPayment}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <CreditCard className="size-4" />
                        )}

                        {isProcessing
                            ? "Processing..."
                            : `Pay ₹${razorpayAmount.toLocaleString("en-IN")}`}
                    </button>

                    <button
                        type="button"
                        onClick={handlePaypalPayment}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <CreditCard className="size-4" />
                        )}

                        {isProcessing
                            ? "Processing..."
                            : `Pay $${paypalAmount.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </section>
    );
}
