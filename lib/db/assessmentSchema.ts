import mongoose, {
    Schema,
    type HydratedDocument,
    type Model,
    type Types,
} from "mongoose";

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                              */
/* -------------------------------------------------------------------------- */

/**
 * Assessment lifecycle.
 *
 * draft:
 * Assessment is being created/configured.
 *
 * published:
 * Assessment is ready to be taken by assigned employees.
 *
 * closed:
 * Assessment is no longer available.
 *
 * archived:
 * Assessment is retained for historical purposes.
 */
export type AssessmentStatus = "draft" | "published" | "closed" | "archived";

/**
 * Employee's assignment state for an assessment.
 *
 * This represents the assignment/delivery state,
 * not the complete attempt state.
 */
export type AssessmentAssignmentStatus =
    | "assigned"
    | "in-progress"
    | "completed"
    | "expired";

/**
 * Supported question types.
 */
export type AssessmentQuestionType =
    | "short-text"
    | "long-text"
    | "coding"
    | "project-report"
    | "mcq";

/**
 * MCQ selection behavior.
 *
 * single:
 * Exactly one correct option.
 *
 * multiple:
 * Multiple correct options are allowed.
 */
export type MCQSelectionType = "single" | "multiple";

/**
 * Coding language.
 *
 * We keep this as a string rather than an enum so that
 * new languages can be introduced without changing the
 * database schema.
 *
 * Examples:
 * javascript
 * typescript
 * python
 * java
 * cpp
 */
export type CodingLanguage = string;

/* -------------------------------------------------------------------------- */
/*                              MCQ Option                                    */
/* -------------------------------------------------------------------------- */

export interface IAssessmentOption {
    /**
     * Stable identifier for this option.
     *
     * Example:
     * option-a
     * option-b
     */
    optionId: string;

    /**
     * Text displayed to the employee.
     *
     * Formatting is preserved.
     */
    text: string;

    /**
     * Whether this option is a correct answer.
     *
     * For:
     *
     * single -> exactly one should be true.
     * multiple -> one or more may be true.
     *
     * IMPORTANT:
     * This field must never be exposed through the
     * employee assessment API.
     */
    isCorrect: boolean;
}

/* -------------------------------------------------------------------------- */
/*                           Assessment Question                              */
/* -------------------------------------------------------------------------- */

export interface IAssessmentQuestion {
    /**
     * Stable identifier for this question.
     *
     * Do not use array index as the permanent identifier.
     */
    questionId: string;

    /**
     * Position of the question inside the assessment.
     */
    order: number;

    /**
     * Question text.
     *
     * Formatting is preserved because questions can
     * contain code examples, spacing and multi-line
     * instructions.
     */
    question: string;

    /**
     * Question type.
     */
    type: AssessmentQuestionType;

    /**
     * Marks assigned to this question.
     */
    points: number;

    /**
     * Whether the employee must answer this question.
     */
    required: boolean;

    /* ---------------------------------------------------------------------- */
    /* MCQ Configuration                                                      */
    /* ---------------------------------------------------------------------- */

    /**
     * Only applicable to:
     *
     * type === "mcq"
     */
    selectionType?: MCQSelectionType;

    /**
     * MCQ options.
     *
     * Only applicable to:
     *
     * type === "mcq"
     */
    options?: IAssessmentOption[];

    /* ---------------------------------------------------------------------- */
    /* Coding Configuration                                                   */
    /* ---------------------------------------------------------------------- */

    /**
     * Programming language expected for the coding answer.
     */
    language?: CodingLanguage;

    /**
     * Optional starter code shown to the employee.
     *
     * IMPORTANT:
     *
     * Formatting must be preserved exactly.
     *
     * Do not trim, normalize whitespace, or collapse
     * line breaks.
     */
    starterCode?: string;

    /**
     * Optional input description.
     *
     * Formatting is preserved.
     */
    inputDescription?: string;

    /**
     * Optional output description.
     *
     * Formatting is preserved.
     */
    outputDescription?: string;

    /**
     * Optional coding constraints.
     *
     * Formatting is preserved.
     */
    constraints?: string;

    /* ---------------------------------------------------------------------- */
    /* Text / Project Configuration                                           */
    /* ---------------------------------------------------------------------- */

    /**
     * Minimum answer length.
     *
     * Applicable to text/project answers.
     */
    minLength?: number;

    /**
     * Maximum answer length.
     *
     * Applicable to text/project answers.
     */
    maxLength?: number;

    /**
     * Placeholder displayed in the answer field.
     */
    answerPlaceholder?: string;

    /* ---------------------------------------------------------------------- */
    /* Evaluation Configuration                                               */
    /* ---------------------------------------------------------------------- */

    /**
     * Whether this question can be evaluated automatically.
     *
     * Examples:
     *
     * MCQ -> true
     * Short text -> potentially true
     * Coding -> potentially true
     * Long text -> false
     * Project report -> false
     */
    autoEvaluate: boolean;

    /**
     * Optional explanation associated with the question.
     *
     * This can be shown later depending on assessment settings.
     */
    explanation?: string;
}

/* -------------------------------------------------------------------------- */
/*                        Employee Assignment                                 */
/* -------------------------------------------------------------------------- */

export interface IAssessmentAssignment {
    /**
     * Employee assigned to this assessment.
     *
     * References Employee._id.
     */
    employeeId: Types.ObjectId;

    /**
     * When the employee was selected/assigned.
     */
    assignedAt: Date;

    /**
     * When the assessment invitation email was sent.
     */
    emailSentAt?: Date;

    /**
     * Assignment progress.
     */
    status: AssessmentAssignmentStatus;

    /**
     * When the employee started the assessment.
     *
     * This is a high-level assignment timestamp.
     *
     * Detailed attempt information will live
     * in AssessmentAttempt.
     */
    startedAt?: Date;

    /**
     * When the employee completed/submitted.
     */
    submittedAt?: Date;
}

/* -------------------------------------------------------------------------- */
/*                         Assessment Timing                                  */
/* -------------------------------------------------------------------------- */

export interface IAssessmentTiming {
    /**
     * Date/time when the assessment becomes available.
     */
    startAt: Date;

    /**
     * Date/time after which the assessment is no longer available.
     */
    endAt: Date;

    /**
     * Maximum duration of an individual employee attempt.
     *
     * Example:
     *
     * Assessment window:
     * 10:00 AM - 2:00 PM
     *
     * Duration:
     * 60 minutes
     *
     * Employee starting at 11:15 AM gets 60 minutes,
     * subject to the assessment end time/business rules.
     */
    durationMinutes: number;
}

/* -------------------------------------------------------------------------- */
/*                           Timer Configuration                              */
/* -------------------------------------------------------------------------- */

export interface IAssessmentTimer {
    /**
     * Whether the assessment timer is enabled.
     */
    enabled: boolean;

    /**
     * Whether the system should automatically submit
     * an active attempt when its timer expires.
     */
    autoSubmitOnExpiry: boolean;
}

/* -------------------------------------------------------------------------- */
/*                          Security Configuration                             */
/* -------------------------------------------------------------------------- */

export interface IAssessmentSecurity {
    /**
     * Whether browser tab/window changes should be tracked.
     */
    trackTabChanges: boolean;

    /**
     * Optional maximum number of tab changes allowed.
     *
     * If undefined, tab changes can be tracked without
     * enforcing a maximum.
     */
    maxTabChanges?: number;
}

/* -------------------------------------------------------------------------- */
/*                         Result Configuration                               */
/* -------------------------------------------------------------------------- */

export interface IAssessmentResultSettings {
    /**
     * Whether employees can see their result after submission.
     */
    showResultToEmployee: boolean;

    /**
     * Whether employees can see correct answers after submission.
     */
    showCorrectAnswersToEmployee: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              Assessment                                    */
/* -------------------------------------------------------------------------- */

export interface IAssessment {
    /**
     * ----------------------------------------------------------------------
     * Employer Relationship
     * ----------------------------------------------------------------------
     *
     * Employer who created and owns this assessment.
     */
    employerId: Types.ObjectId;

    /**
     * ----------------------------------------------------------------------
     * Basic Information
     * ----------------------------------------------------------------------
     */

    /**
     * Assessment title.
     *
     * Example:
     * "Frontend Developer Assessment"
     */
    title: string;

    /**
     * Optional assessment description.
     */
    description?: string;

    /**
     * Instructions shown to employees before they start.
     */
    instructions?: string;

    /**
     * ----------------------------------------------------------------------
     * Skills
     * ----------------------------------------------------------------------
     *
     * Skills being evaluated by this assessment.
     *
     * Example:
     *
     * [
     *     "JavaScript",
     *     "React",
     *     "TypeScript",
     *     "Problem Solving"
     * ]
     */
    skills: string[];

    /**
     * ----------------------------------------------------------------------
     * Timing
     * ----------------------------------------------------------------------
     */

    timing: IAssessmentTiming;

    /**
     * ----------------------------------------------------------------------
     * Timer
     * ----------------------------------------------------------------------
     */

    timer: IAssessmentTimer;

    /**
     * ----------------------------------------------------------------------
     * Security
     * ----------------------------------------------------------------------
     */

    security: IAssessmentSecurity;

    /**
     * ----------------------------------------------------------------------
     * Questions
     * ----------------------------------------------------------------------
     *
     * An assessment can contain:
     *
     * - one question
     * - multiple questions
     *
     * The questions can have different types.
     */
    questions: IAssessmentQuestion[];

    /**
     * ----------------------------------------------------------------------
     * Employee Assignments
     * ----------------------------------------------------------------------
     *
     * Employees selected by the employer to receive this assessment.
     */
    assignedEmployees: IAssessmentAssignment[];

    /**
     * ----------------------------------------------------------------------
     * Scoring
     * ----------------------------------------------------------------------
     *
     * Total possible points across all questions.
     */
    totalPoints: number;

    /**
     * ----------------------------------------------------------------------
     * Result Settings
     * ----------------------------------------------------------------------
     */

    resultSettings: IAssessmentResultSettings;

    /**
     * ----------------------------------------------------------------------
     * Assessment Lifecycle
     * ----------------------------------------------------------------------
     */

    status: AssessmentStatus;

    createdAt: Date;
    updatedAt: Date;
}

export type AssessmentDocument = HydratedDocument<IAssessment>;

/* -------------------------------------------------------------------------- */
/*                          Option Schema                                     */
/* -------------------------------------------------------------------------- */

const assessmentOptionSchema = new Schema<IAssessmentOption>(
    {
        optionId: {
            type: String,
            required: true,
            trim: true,
        },

        /**
         * Do not trim option text.
         *
         * This keeps authored formatting intact.
         */
        text: {
            type: String,
            required: true,
            trim: false,
        },

        /**
         * Correct answer information is stored server-side.
         *
         * NEVER expose this field through employee-facing APIs.
         */
        isCorrect: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        _id: false,
    },
);

/* -------------------------------------------------------------------------- */
/*                         Question Schema                                    */
/* -------------------------------------------------------------------------- */

const assessmentQuestionSchema = new Schema<IAssessmentQuestion>(
    {
        questionId: {
            type: String,
            required: true,
            trim: true,
        },

        order: {
            type: Number,
            required: true,
            min: 1,
        },

        /**
         * Preserve question formatting.
         */
        question: {
            type: String,
            required: true,
            trim: false,
        },

        type: {
            type: String,
            enum: [
                "short-text",
                "long-text",
                "coding",
                "project-report",
                "mcq",
            ],
            required: true,
        },

        points: {
            type: Number,
            required: true,
            min: 0,
            default: 1,
        },

        required: {
            type: Boolean,
            required: true,
            default: true,
        },

        /* ------------------------------------------------------------------ */
        /* MCQ                                                                  */
        /* ------------------------------------------------------------------ */

        selectionType: {
            type: String,
            enum: ["single", "multiple"],
        },

        options: {
            type: [assessmentOptionSchema],
            default: undefined,
        },

        /* ------------------------------------------------------------------ */
        /* Coding                                                               */
        /* ------------------------------------------------------------------ */

        language: {
            type: String,
            trim: true,
        },

        /**
         * IMPORTANT:
         *
         * Do not trim starter code.
         */
        starterCode: {
            type: String,
            trim: false,
        },

        inputDescription: {
            type: String,
            trim: false,
        },

        outputDescription: {
            type: String,
            trim: false,
        },

        constraints: {
            type: String,
            trim: false,
        },

        /* ------------------------------------------------------------------ */
        /* Text / Project                                                       */
        /* ------------------------------------------------------------------ */

        minLength: {
            type: Number,
            min: 0,
        },

        maxLength: {
            type: Number,
            min: 1,
        },

        answerPlaceholder: {
            type: String,
            trim: false,
        },

        /* ------------------------------------------------------------------ */
        /* Evaluation                                                           */
        /* ------------------------------------------------------------------ */

        autoEvaluate: {
            type: Boolean,
            required: true,
            default: false,
        },

        explanation: {
            type: String,
            trim: false,
        },
    },
    {
        _id: false,
    },
);

/* -------------------------------------------------------------------------- */
/*                         Assignment Schema                                  */
/* -------------------------------------------------------------------------- */

const assessmentAssignmentSchema = new Schema<IAssessmentAssignment>(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        assignedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },

        emailSentAt: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["assigned", "in-progress", "completed", "expired"],
            required: true,
            default: "assigned",
        },

        startedAt: {
            type: Date,
        },

        submittedAt: {
            type: Date,
        },
    },
    {
        _id: false,
    },
);

/* -------------------------------------------------------------------------- */
/*                          Timing Schema                                     */
/* -------------------------------------------------------------------------- */

const assessmentTimingSchema = new Schema<IAssessmentTiming>(
    {
        startAt: {
            type: Date,
            required: true,
        },

        endAt: {
            type: Date,
            required: true,
        },

        durationMinutes: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        _id: false,
    },
);

/* -------------------------------------------------------------------------- */
/*                           Timer Schema                                     */
/* -------------------------------------------------------------------------- */

const assessmentTimerSchema = new Schema<IAssessmentTimer>(
    {
        enabled: {
            type: Boolean,
            required: true,
            default: true,
        },

        autoSubmitOnExpiry: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        _id: false,
    },
);

/* -------------------------------------------------------------------------- */
/*                         Security Schema                                    */
/* -------------------------------------------------------------------------- */

const assessmentSecuritySchema = new Schema<IAssessmentSecurity>(
    {
        trackTabChanges: {
            type: Boolean,
            required: true,
            default: false,
        },

        maxTabChanges: {
            type: Number,
            min: 0,
        },
    },
    {
        _id: false,
    },
);

/* -------------------------------------------------------------------------- */
/*                       Result Settings Schema                               */
/* -------------------------------------------------------------------------- */

const assessmentResultSettingsSchema = new Schema<IAssessmentResultSettings>(
    {
        showResultToEmployee: {
            type: Boolean,
            required: true,
            default: false,
        },

        showCorrectAnswersToEmployee: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        _id: false,
    },
);

/* -------------------------------------------------------------------------- */
/*                         Assessment Schema                                  */
/* -------------------------------------------------------------------------- */

const assessmentSchema = new Schema<IAssessment>(
    {
        /**
         * --------------------------------------------------------------
         * Employer Relationship
         * --------------------------------------------------------------
         */

        employerId: {
            type: Schema.Types.ObjectId,
            ref: "Employer",
            required: true,
            index: true,
        },

        /**
         * --------------------------------------------------------------
         * Basic Information
         * --------------------------------------------------------------
         */

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: false,
        },

        instructions: {
            type: String,
            trim: false,
        },

        /**
         * --------------------------------------------------------------
         * Skills
         * --------------------------------------------------------------
         */

        skills: {
            type: [String],
            default: [],
        },

        /**
         * --------------------------------------------------------------
         * Timing
         * --------------------------------------------------------------
         */

        timing: {
            type: assessmentTimingSchema,
            required: true,
        },

        /**
         * --------------------------------------------------------------
         * Timer
         * --------------------------------------------------------------
         */

        timer: {
            type: assessmentTimerSchema,
            required: true,
            default: () => ({}),
        },

        /**
         * --------------------------------------------------------------
         * Security
         * --------------------------------------------------------------
         */

        security: {
            type: assessmentSecuritySchema,
            required: true,
            default: () => ({}),
        },

        /**
         * --------------------------------------------------------------
         * Questions
         * --------------------------------------------------------------
         */

        questions: {
            type: [assessmentQuestionSchema],
            default: [],
        },

        /**
         * --------------------------------------------------------------
         * Employee Assignments
         * --------------------------------------------------------------
         */

        assignedEmployees: {
            type: [assessmentAssignmentSchema],
            default: [],
        },

        /**
         * --------------------------------------------------------------
         * Scoring
         * --------------------------------------------------------------
         */

        totalPoints: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        /**
         * --------------------------------------------------------------
         * Result Settings
         * --------------------------------------------------------------
         */

        resultSettings: {
            type: assessmentResultSettingsSchema,
            required: true,
            default: () => ({}),
        },

        /**
         * --------------------------------------------------------------
         * Assessment Status
         * --------------------------------------------------------------
         */

        status: {
            type: String,
            enum: ["draft", "published", "closed", "archived"],
            required: true,
            default: "draft",
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

/* -------------------------------------------------------------------------- */
/*                                Indexes                                     */
/* -------------------------------------------------------------------------- */

/**
 * Employer's assessment list.
 */
assessmentSchema.index({
    employerId: 1,
    createdAt: -1,
});

/**
 * Employer's assessments by status.
 */
assessmentSchema.index({
    employerId: 1,
    status: 1,
});

/**
 * Find assessments assigned to an employee.
 */
assessmentSchema.index({
    "assignedEmployees.employeeId": 1,
});

/**
 * Useful for availability-window queries.
 */
assessmentSchema.index({
    "timing.startAt": 1,
    "timing.endAt": 1,
});

/* -------------------------------------------------------------------------- */
/*                          Model Initialization                              */
/* -------------------------------------------------------------------------- */

const Assessment: Model<IAssessment> =
    mongoose.models.Assessment ||
    mongoose.model<IAssessment>("Assessment", assessmentSchema);

export default Assessment;
