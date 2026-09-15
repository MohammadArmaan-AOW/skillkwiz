import mongoose, { Schema, Types } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                              Attempt Status                                */
/* -------------------------------------------------------------------------- */

export type AssessmentAttemptStatus = "in-progress" | "completed" | "expired";

export type AssessmentSubmissionType = "manual" | "auto";

/* -------------------------------------------------------------------------- */
/*                               Attempt Answer                                */
/* -------------------------------------------------------------------------- */

export interface IAssessmentAttemptAnswer {
    questionId: string;

    /**
     * Text / coding / project-report answer.
     */
    answer?: string;

    /**
     * Selected MCQ option IDs.
     *
     * Always stored as an array so both
     * single and multiple selection use
     * the same structure.
     */
    selectedOptions?: string[];

    /**
     * Last time this answer was changed.
     */
    answeredAt: Date;

    /**
     * Final marks awarded for this question.
     *
     * Optional so existing attempts remain compatible.
     */
    awardedPoints?: number;

    /**
     * Optional note/feedback from the employer.
     */
    gradingNote?: string;

    /**
     * Whether the marks were manually overridden
     * by the employer.
     */
    manuallyGraded?: boolean;

    /**
     * When the employer last graded/overrode
     * this answer.
     */
    gradedAt?: Date;

}

/* -------------------------------------------------------------------------- */
/*                            Assessment Attempt                               */
/* -------------------------------------------------------------------------- */

export interface IAssessmentAttempt {
    assessmentId: Types.ObjectId;
    employeeId: Types.ObjectId;

    /**
     * Reference to the employee's assignment
     * inside Assessment.assignedEmployees.
     *
     * This is optional because the current
     * Assessment schema embeds assignments.
     */
    assignmentId?: Types.ObjectId;

    status: AssessmentAttemptStatus;

    /**
     * Server time when the employee actually
     * started the attempt.
     */
    startedAt: Date;

    /**
     * Server-calculated deadline.
     *
     * For timed assessments:
     *
     * min(
     *   startedAt + durationMinutes,
     *   assessment.timing.endAt
     * )
     */
    expiresAt?: Date;

    /**
     * When the attempt was finally submitted.
     */
    submittedAt?: Date;

    /**
     * Answers saved during the attempt.
     */
    answers: IAssessmentAttemptAnswer[];

    /**
     * Number of browser tab/window changes.
     */
    tabChangeCount: number;

    /**
     * Final calculated score.
     */
    score?: number;

    /**
     * Final percentage.
     */
    percentage?: number;

    /**
     * Whether the employee passed.
     *
     * Kept optional because the current
     * Assessment schema does not define
     * a passing score field.
     */
    passed?: boolean;

    /**
     * How the attempt was finalized.
     */
    submissionType?: AssessmentSubmissionType;

    createdAt: Date;
    updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                            Answer Schema                                    */
/* -------------------------------------------------------------------------- */

const assessmentAttemptAnswerSchema =
    new Schema<IAssessmentAttemptAnswer>(
        {
            questionId: {
                type: String,
                required: true,
                trim: true,
            },

            answer: {
                type: String,
                required: false,
            },

            selectedOptions: {
                type: [String],
                required: false,
                default: undefined,
            },

            answeredAt: {
                type: Date,
                required: true,
                default: Date.now,
            },

            /**
             * Final marks awarded for this question.
             *
             * This can be generated automatically or
             * overridden by the employer.
             */
            awardedPoints: {
                type: Number,
                required: false,
                min: 0,
            },

            /**
             * Optional feedback/note from employer.
             */
            gradingNote: {
                type: String,
                required: false,
                trim: false,
            },

            /**
             * Whether the employer manually graded
             * or overrode this question.
             */
            manuallyGraded: {
                type: Boolean,
                required: false,
                default: false,
            },

            /**
             * Last time this answer was manually graded.
             */
            gradedAt: {
                type: Date,
                required: false,
            },
        },
        {
            _id: false,
        },
    );

/* -------------------------------------------------------------------------- */
/*                         Assessment Attempt Schema                           */
/* -------------------------------------------------------------------------- */

const assessmentAttemptSchema = new Schema<IAssessmentAttempt>(
    {
        assessmentId: {
            type: Schema.Types.ObjectId,
            ref: "Assessment",
            required: true,
            index: true,
        },

        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        assignmentId: {
            type: Schema.Types.ObjectId,
            required: false,
        },

        status: {
            type: String,
            enum: ["in-progress", "completed", "expired"],
            required: true,
            default: "in-progress",
            index: true,
        },

        startedAt: {
            type: Date,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: false,
            index: true,
        },

        submittedAt: {
            type: Date,
            required: false,
        },

        answers: {
            type: [assessmentAttemptAnswerSchema],
            default: [],
        },

        tabChangeCount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        score: {
            type: Number,
            required: false,
            min: 0,
        },

        percentage: {
            type: Number,
            required: false,
            min: 0,
            max: 100,
        },

        passed: {
            type: Boolean,
            required: false,
        },

        submissionType: {
            type: String,
            enum: ["manual", "auto"],
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

/* -------------------------------------------------------------------------- */
/*                                  Indexes                                   */
/* -------------------------------------------------------------------------- */

assessmentAttemptSchema.index({
    employeeId: 1,
    assessmentId: 1,
});

assessmentAttemptSchema.index({
    employeeId: 1,
    status: 1,
});

assessmentAttemptSchema.index({
    expiresAt: 1,
    status: 1,
});

/* -------------------------------------------------------------------------- */
/*                                   Model                                    */
/* -------------------------------------------------------------------------- */

const AssessmentAttempt =
    mongoose.models.AssessmentAttempt ||
    mongoose.model<IAssessmentAttempt>(
        "AssessmentAttempt",
        assessmentAttemptSchema,
    );

export default AssessmentAttempt;
