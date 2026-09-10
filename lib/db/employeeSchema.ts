import mongoose, {
    Schema,
    type Model,
    type HydratedDocument,
    type Types,
} from "mongoose";

export interface IEmployee {
    /**
     * Employer who created this employee account.
     */
    employerId: Types.ObjectId;

    /**
     * Human-readable employee login ID.
     *
     * Example:
     * SKEMP-8F4K2P
     */
    employeeId: string;

    /**
     * Employee's personal information.
     */
    fullName: string;

    email: string;

    phoneNumber?: string;

    department?: string;

    designation?: string;

    /**
     * Authentication.
     *
     * Employees do not self-signup.
     * Their account is created by an employer.
     */
    passwordHash: string;

    /**
     * Forces the employee to change the generated
     * password after their first successful login.
     */
    mustChangePassword: boolean;

    /**
     * Email verification.
     *
     * Employee must verify their email before
     * getting complete access to the system.
     */
    emailVerified: boolean;

    emailOtpHash?: string;

    emailOtpExpiresAt?: Date;

    /**
     * Employee login tracking.
     */
    hasSignedIn: boolean;

    firstSignedInAt?: Date;

    lastSignedInAt?: Date;

    /**
     * Account/invitation status.
     */
    invitationSentAt?: Date;

    invitationAcceptedAt?: Date;

    /**
     * Whether the employee account is currently active.
     */
    isActive: boolean;

    /**
     * Credit information.
     *
     * One credit is consumed when the employer creates
     * this employee account.
     */
    creditConsumed: boolean;

    creditConsumedAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}

export type EmployeeDocument = HydratedDocument<IEmployee>;

const employeeSchema = new Schema<IEmployee>(
    {
        employerId: {
            type: Schema.Types.ObjectId,
            ref: "Employer",
            required: true,
            index: true,
        },

        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phoneNumber: {
            type: String,
            trim: true,
        },

        department: {
            type: String,
            trim: true,
        },

        designation: {
            type: String,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        mustChangePassword: {
            type: Boolean,
            default: true,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        emailOtpHash: {
            type: String,
            select: false,
        },

        emailOtpExpiresAt: {
            type: Date,
            select: false,
        },

        hasSignedIn: {
            type: Boolean,
            default: false,
        },

        firstSignedInAt: {
            type: Date,
        },

        lastSignedInAt: {
            type: Date,
        },

        invitationSentAt: {
            type: Date,
        },

        invitationAcceptedAt: {
            type: Date,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        creditConsumed: {
            type: Boolean,
            default: true,
        },

        creditConsumedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

/**
 * An employer cannot create two employee accounts
 * with the same email address.
 *
 * The same email can technically exist under different
 * employers, which is useful if one person works for
 * multiple organizations.
 */
employeeSchema.index(
    {
        employerId: 1,
        email: 1,
    },
    {
        unique: true,
    },
);

const Employee: Model<IEmployee> =
    mongoose.models.Employee ||
    mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;
