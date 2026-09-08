import mongoose, {
    Schema,
    type Model,
    type HydratedDocument,
} from "mongoose";

export type AuthProvider = "email" | "google";

export interface IEmployer {
    fullName: string;
    email: string;
    passwordHash?: string;
    emailVerified: boolean;
    googleId?: string;
    authProvider: AuthProvider;

    profilePhoto?: string | null;

    emailOtpHash?: string;
    emailOtpExpiresAt?: Date;

    forgotPasswordToken?: string;
    forgotPasswordExpiresAt?: Date;

    resetPasswordToken?: string;
    resetPasswordExpiresAt?: Date;

    phoneNumber?: string;
    companyName?: string;
    companyAddress?: string;
    department?: string;

    credits: number;

    createdAt: Date;
    updatedAt: Date;
}

export type EmployerDocument = HydratedDocument<IEmployer>;

const employerSchema = new Schema<IEmployer>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            select: false,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        authProvider: {
            type: String,
            enum: ["email", "google"],
            default: "email",
        },

        profilePhoto: {
            type: String,
            default: null,
        },

        emailOtpHash: {
            type: String,
            select: false,
        },

        emailOtpExpiresAt: {
            type: Date,
            select: false,
        },

        forgotPasswordToken: {
            type: String,
            select: false,
        },

        forgotPasswordExpiresAt: {
            type: Date,
            select: false,
        },

        resetPasswordToken: {
            type: String,
            select: false,
        },

        resetPasswordExpiresAt: {
            type: Date,
            select: false,
        },

        phoneNumber: {
            type: String,
            trim: true,
        },

        companyName: {
            type: String,
            trim: true,
        },

        companyAddress: {
            type: String,
            trim: true,
        },

        department: {
            type: String,
            trim: true,
        },

        credits: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    },
);

const Employer: Model<IEmployer> =
    mongoose.models.Employer ||
    mongoose.model<IEmployer>("Employer", employerSchema);

export default Employer;