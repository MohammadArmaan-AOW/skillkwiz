import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type PaymentProvider = "razorpay" | "paypal";

export type PaymentStatus =
    | "created"
    | "pending"
    | "authorized"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded";

export type PaymentPurpose = "credit_purchase";

export interface IPayment {
    employerId: mongoose.Types.ObjectId;

    provider: PaymentProvider;

    providerOrderId?: string;

    providerPaymentId?: string;

    providerCustomerId?: string;

    amount: number;

    currency: string;

    status: PaymentStatus;

    purpose: PaymentPurpose;

    creditsPurchased: number;

    creditsGranted: boolean;

    metadata?: Record<string, unknown>;

    paidAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export type PaymentDocument = HydratedDocument<IPayment>;

const paymentSchema = new Schema<IPayment>(
    {
        employerId: {
            type: Schema.Types.ObjectId,
            ref: "Employer",
            required: true,
            index: true,
        },

        provider: {
            type: String,
            enum: ["razorpay", "paypal"],
            required: true,
        },

        providerOrderId: {
            type: String,
            trim: true,
            index: true,
        },

        providerPaymentId: {
            type: String,
            trim: true,
            index: true,
        },

        providerCustomerId: {
            type: String,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "created",
                "pending",
                "authorized",
                "paid",
                "failed",
                "cancelled",
                "refunded",
            ],
            default: "created",
            index: true,
        },

        purpose: {
            type: String,
            enum: ["credit_purchase"],
            required: true,
        },

        creditsPurchased: {
            type: Number,
            required: true,
            min: 1,
        },

        creditsGranted: {
            type: Boolean,
            default: false,
        },

        metadata: {
            type: Schema.Types.Mixed,
        },

        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

paymentSchema.index({
    employerId: 1,
    createdAt: -1,
});

paymentSchema.index({
    provider: 1,
    providerOrderId: 1,
});

paymentSchema.index({
    provider: 1,
    providerPaymentId: 1,
});

const Payment: Model<IPayment> =
    mongoose.models.Payment ||
    mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
