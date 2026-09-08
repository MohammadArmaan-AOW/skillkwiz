import mongoose, {
    Schema,
    type HydratedDocument,
    type Model,
} from "mongoose";

export type PaymentProvider = "razorpay" | "paypal";

export type PaymentMethodType = "card" | "paypal";

export type PaymentMethodStatus =
    | "active"
    | "inactive"
    | "failed"
    | "expired";

export interface IPaymentMethod {
    employerId: mongoose.Types.ObjectId;

    provider: PaymentProvider;

    type: PaymentMethodType;

    status: PaymentMethodStatus;

    /**
     * Provider-side customer identifier.
     *
     * Razorpay / PayPal can have their own customer representation.
     */
    providerCustomerId?: string;

    /**
     * Provider-side payment method/card/vault identifier.
     *
     * Never store the actual card number or CVV.
     */
    providerPaymentMethodId?: string;

    /**
     * Card metadata only.
     */
    card?: {
        brand?: string;
        last4?: string;
        expiryMonth?: number;
        expiryYear?: number;
        cardholderName?: string;
    };

    /**
     * Whether this payment method is currently usable
     * for SkillKwiz payments.
     */
    verified: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export type PaymentMethodDocument =
    HydratedDocument<IPaymentMethod>;

const paymentMethodSchema = new Schema<IPaymentMethod>(
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

        type: {
            type: String,
            enum: ["card", "paypal"],
            required: true,
        },

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "failed",
                "expired",
            ],
            default: "active",
        },

        providerCustomerId: {
            type: String,
            trim: true,
        },

        providerPaymentMethodId: {
            type: String,
            trim: true,
        },

        card: {
            brand: {
                type: String,
                trim: true,
            },

            last4: {
                type: String,
                trim: true,
                maxlength: 4,
            },

            expiryMonth: {
                type: Number,
                min: 1,
                max: 12,
            },

            expiryYear: {
                type: Number,
            },

            cardholderName: {
                type: String,
                trim: true,
                maxlength: 300,
            },
        },

        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

paymentMethodSchema.index(
    { employerId: 1, provider: 1 },
);

paymentMethodSchema.index(
    { employerId: 1, status: 1, verified: 1 },
);

const PaymentMethod: Model<IPaymentMethod> =
    mongoose.models.PaymentMethod ||
    mongoose.model<IPaymentMethod>(
        "PaymentMethod",
        paymentMethodSchema,
    );

export default PaymentMethod;