export type PaymentProvider = "razorpay" | "paypal";

export const CREDIT_PRICING = {
    razorpay: {
        currency: "INR",
        pricePerCredit: 100,
    },

    paypal: {
        currency: "USD",
        pricePerCredit: 1,
    },
} as const;

export function getCreditPrice(provider: PaymentProvider, credits: number) {
    return credits * CREDIT_PRICING[provider].pricePerCredit;
}
