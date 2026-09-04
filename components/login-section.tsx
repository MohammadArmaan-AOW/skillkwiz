"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    BarChart3,
    Eye,
    EyeOff,
    FileText,
    Play,
    Search,
    Target,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

type SignInForm = {
    email: string;
    password: string;
    rememberMe: boolean;
};

type SignUpForm = {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
};

const featureItems = [
    { icon: Target, label: "Assess", className: "text-secondary" },
    { icon: BarChart3, label: "Measure", className: "text-primary" },
    { icon: Play, label: "Evaluate", className: "text-accent", filled: true },
    { icon: Search, label: "Discover", className: "text-accent" },
    { icon: Users, label: "Connect", className: "text-primary" },
    { icon: FileText, label: "Report", className: "text-secondary" },
];

export default function LoginSection() {
    const reduceMotion = useReducedMotion();
    const [activeTab, setActiveTab] = useState<AuthMode>("signin");

    const [signInForm, setSignInForm] = useState<SignInForm>({
        email: "",
        password: "",
        rememberMe: false,
    });

    const [signUpForm, setSignUpForm] = useState<SignUpForm>({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });

    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const switchTab = (tab: AuthMode) => {
        setActiveTab(tab);
        setError("");
    };

    const handleSignInChange = (
        field: keyof SignInForm,
        value: string | boolean,
    ) => {
        setSignInForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSignUpChange = (
        field: keyof SignUpForm,
        value: string | boolean,
    ) => {
        setSignUpForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!signInForm.email || !signInForm.password) {
            setError("Please enter your email and password.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Connect your authentication API here.
            // Example:
            // await signIn(signInForm);

            await new Promise((resolve) => setTimeout(resolve, 600));
        } catch {
            setError("Unable to sign in. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (
            !signUpForm.fullName ||
            !signUpForm.email ||
            !signUpForm.password ||
            !signUpForm.confirmPassword
        ) {
            setError("Please complete all required fields.");
            return;
        }

        if (signUpForm.password !== signUpForm.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!signUpForm.agreeToTerms) {
            setError("Please accept the Terms of Service and Privacy Policy.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Connect your registration API here.
            // Example:
            // await signUp(signUpForm);

            await new Promise((resolve) => setTimeout(resolve, 600));
        } catch {
            setError("Unable to create your account. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={
                        reduceMotion ? undefined : { opacity: 1, y: 0 }
                    }
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="
                        overflow-hidden rounded-2xl border border-border
                        bg-card shadow-sm
                        md:grid md:grid-cols-2
                    "
                >
                    {/* =====================================================
                        LEFT SIDE — SKILL ASSESSMENT LIBRARY
                    ====================================================== */}

                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                        whileInView={
                            reduceMotion ? undefined : { opacity: 1, x: 0 }
                        }
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="
                            relative flex min-h-[460px] items-center
                            overflow-hidden bg-muted/30
                            px-6 py-10
                            sm:px-10 sm:py-12
                            md:min-h-[620px]
                            lg:px-14
                        "
                    >
                        {/* Decorative background */}
                        <div
                            aria-hidden="true"
                            className="
                                pointer-events-none absolute -right-24 -top-24
                                h-72 w-72 rounded-full
                                bg-secondary/5 blur-3xl
                            "
                        />

                        <div
                            aria-hidden="true"
                            className="
                                pointer-events-none absolute -bottom-32 -left-24
                                h-80 w-80 rounded-full
                                bg-primary/10 blur-3xl
                            "
                        />

                        <div className="relative z-10 w-full">
                            {/* Heading */}
                            <motion.div
                                className="mx-auto max-w-md text-center"
                                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: 0.2 }}
                            >
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                                    SkillKwiz Platform
                                </p>

                                <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                                    <span className="text-primary">
                                        SKILL
                                    </span>
                                    <br />

                                    <span className="text-primary-gradient">
                                        ASSESSMENT
                                    </span>
                                    <br />

                                    <span className="text-secondary">
                                        LIBRARY
                                    </span>
                                </h2>

                                <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                                    Explore verified skill assessments designed
                                    to help organizations evaluate talent with
                                    greater confidence.
                                </p>
                            </motion.div>

                            {/* Feature icons */}
                            <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-x-5 gap-y-7 sm:mt-12 sm:gap-x-8">
                                {featureItems.map((feature, index) => (
                                    <FeatureIcon
                                        key={feature.label}
                                        {...feature}
                                        delay={0.28 + index * 0.06}
                                    />
                                ))}
                            </div>

                            {/* Bottom message */}
                            <motion.div
                                className="mx-auto mt-10 max-w-md rounded-xl border border-border bg-background/80 p-4 text-center backdrop-blur-sm"
                                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.6 }}
                            >
                                <p className="text-sm font-medium text-foreground">
                                    Assess skills. Find potential.
                                </p>

                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    A smarter approach to modern talent
                                    evaluation.
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* =====================================================
                        RIGHT SIDE — AUTHENTICATION
                    ====================================================== */}

                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="
                            flex items-center
                            bg-primary
                            px-5 py-8
                            sm:px-8 sm:py-10
                            lg:px-12
                        "
                    >
                        <div className="mx-auto w-full max-w-md">
                            {/* Header */}
                            <div className="mb-7">
                                <p className="text-sm font-medium text-primary-foreground/70">
                                    Welcome to SkillKwiz
                                </p>

                                <h3 className="mt-1 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                                    {activeTab === "signin"
                                        ? "Sign in to continue"
                                        : "Create your account"}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-primary-foreground/65">
                                    {activeTab === "signin"
                                        ? "Access your SkillKwiz account and continue your assessment journey."
                                        : "Create your SkillKwiz account and get started with skill assessments."}
                                </p>
                            </div>

                            {/* Tabs */}
                            <div
                                className="mb-7 grid grid-cols-2 border-b border-primary-foreground/15"
                                role="tablist"
                                aria-label="Authentication options"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === "signin"}
                                    onClick={() => switchTab("signin")}
                                    className={cn(
                                        "relative px-3 pb-3 text-sm font-semibold transition-colors",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                                        activeTab === "signin"
                                            ? "text-primary-foreground"
                                            : "text-primary-foreground/50 hover:text-primary-foreground/80",
                                    )}
                                >
                                    Sign In

                                    {activeTab === "signin" && (
                                        <motion.span layoutId="auth-tab-indicator" className="absolute inset-x-0 -bottom-px h-0.5 bg-secondary" transition={{ duration: 0.25 }} />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === "signup"}
                                    onClick={() => switchTab("signup")}
                                    className={cn(
                                        "relative px-3 pb-3 text-sm font-semibold transition-colors",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                                        activeTab === "signup"
                                            ? "text-primary-foreground"
                                            : "text-primary-foreground/50 hover:text-primary-foreground/80",
                                    )}
                                >
                                    Sign Up

                                    {activeTab === "signup" && (
                                        <motion.span layoutId="auth-tab-indicator" className="absolute inset-x-0 -bottom-px h-0.5 bg-secondary" transition={{ duration: 0.25 }} />
                                    )}
                                </button>
                            </div>

                            {/* Error */}
                            <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    role="alert"
                                    initial={{ opacity: 0, height: 0, y: -6 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                    className="
                                        mb-5 rounded-lg border
                                        border-destructive/30
                                        bg-destructive/10
                                        px-4 py-3 text-sm
                                        text-primary-foreground
                                    "
                                >
                                    {error}
                                </motion.div>
                            )}
                            </AnimatePresence>

                            {/* =================================================
                                SIGN IN
                            ================================================== */}

                            <AnimatePresence mode="wait" initial={false}>
                            {activeTab === "signin" ? (
                                <motion.form key="signin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} onSubmit={handleSignIn} className="space-y-5">
                                    <AuthField
                                        id="signin-email"
                                        label="Email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={signInForm.email}
                                        autoComplete="email"
                                        onChange={(value) =>
                                            handleSignInChange(
                                                "email",
                                                value,
                                            )
                                        }
                                    />

                                    <PasswordField
                                        id="signin-password"
                                        label="Password"
                                        placeholder="Enter your password"
                                        value={signInForm.password}
                                        visible={showSignInPassword}
                                        autoComplete="current-password"
                                        onToggle={() =>
                                            setShowSignInPassword(
                                                (current) => !current,
                                            )
                                        }
                                        onChange={(value) =>
                                            handleSignInChange(
                                                "password",
                                                value,
                                            )
                                        }
                                    />

                                    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                                        <label className="flex cursor-pointer items-center gap-2 text-primary-foreground/75">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    signInForm.rememberMe
                                                }
                                                onChange={(event) =>
                                                    handleSignInChange(
                                                        "rememberMe",
                                                        event.target.checked,
                                                    )
                                                }
                                                className="
                                                    h-4 w-4 rounded
                                                    border-primary-foreground/30
                                                    accent-secondary
                                                "
                                            />

                                            <span>Remember me</span>
                                        </label>

                                        <a
                                            href="/forgot-password"
                                            className="
                                                font-medium
                                                text-primary-foreground/80
                                                transition-colors
                                                hover:text-primary-foreground
                                                hover:underline
                                                focus-visible:outline-none
                                                focus-visible:ring-2
                                                focus-visible:ring-ring
                                            "
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    <SubmitButton
                                        loading={isSubmitting}
                                        label="Sign In"
                                    />

                                    <SocialLogin mode="signin" />
                                </motion.form>
                            ) : (
                                /* =============================================
                                    SIGN UP
                                ============================================== */

                                <motion.form key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} onSubmit={handleSignUp} className="space-y-4">
                                    <AuthField
                                        id="signup-name"
                                        label="Full Name"
                                        type="text"
                                        placeholder="Your full name"
                                        value={signUpForm.fullName}
                                        autoComplete="name"
                                        onChange={(value) =>
                                            handleSignUpChange(
                                                "fullName",
                                                value,
                                            )
                                        }
                                    />

                                    <AuthField
                                        id="signup-email"
                                        label="Email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={signUpForm.email}
                                        autoComplete="email"
                                        onChange={(value) =>
                                            handleSignUpChange(
                                                "email",
                                                value,
                                            )
                                        }
                                    />

                                    <PasswordField
                                        id="signup-password"
                                        label="Password"
                                        placeholder="Create a password"
                                        value={signUpForm.password}
                                        visible={showSignUpPassword}
                                        autoComplete="new-password"
                                        onToggle={() =>
                                            setShowSignUpPassword(
                                                (current) => !current,
                                            )
                                        }
                                        onChange={(value) =>
                                            handleSignUpChange(
                                                "password",
                                                value,
                                            )
                                        }
                                    />

                                    <PasswordField
                                        id="signup-confirm-password"
                                        label="Confirm Password"
                                        placeholder="Confirm your password"
                                        value={signUpForm.confirmPassword}
                                        visible={showConfirmPassword}
                                        autoComplete="new-password"
                                        onToggle={() =>
                                            setShowConfirmPassword(
                                                (current) => !current,
                                            )
                                        }
                                        onChange={(value) =>
                                            handleSignUpChange(
                                                "confirmPassword",
                                                value,
                                            )
                                        }
                                    />

                                    <label className="flex cursor-pointer items-start gap-3 pt-1 text-xs leading-5 text-primary-foreground/70">
                                        <input
                                            type="checkbox"
                                            checked={
                                                signUpForm.agreeToTerms
                                            }
                                            onChange={(event) =>
                                                handleSignUpChange(
                                                    "agreeToTerms",
                                                    event.target.checked,
                                                )
                                            }
                                            className="
                                                mt-1 h-4 w-4 shrink-0
                                                rounded
                                                border-primary-foreground/30
                                                accent-secondary
                                            "
                                        />

                                        <span>
                                            I agree to the{" "}
                                            <a
                                                href="/terms"
                                                className="font-medium text-primary-foreground hover:underline"
                                            >
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="/privacy"
                                                className="font-medium text-primary-foreground hover:underline"
                                            >
                                                Privacy Policy
                                            </a>
                                            .
                                        </span>
                                    </label>

                                    <SubmitButton
                                        loading={isSubmitting}
                                        label="Create Account"
                                    />

                                    <SocialLogin mode="signup" />
                                </motion.form>
                            )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

/* =========================================================
   FEATURE ICON
========================================================= */

type FeatureIconProps = {
    icon: React.ComponentType<{
        className?: string;
        strokeWidth?: number;
        fill?: string;
    }>;
    label: string;
    className?: string;
    filled?: boolean;
    delay?: number;
};

function FeatureIcon({
    icon: Icon,
    label,
    className,
    filled = false,
    delay = 0,
}: FeatureIconProps) {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div className="flex flex-col items-center gap-2" initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }} whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.35, delay }}>
            <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full",
                    "border border-border bg-background",
                    "transition-transform duration-300",
                    className,
                )}
            >
                <Icon
                    className="h-6 w-6"
                    strokeWidth={1.8}
                    fill={filled ? "currentColor" : "none"}
                />
            </motion.div>

            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
        </motion.div>
    );
}

/* =========================================================
   FORM FIELD
========================================================= */

type AuthFieldProps = {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    value: string;
    autoComplete?: string;
    onChange: (value: string) => void;
};

function AuthField({
    id,
    label,
    type,
    placeholder,
    value,
    autoComplete,
    onChange,
}: AuthFieldProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="text-sm font-medium text-primary-foreground/90"
            >
                {label}
            </label>

            <input
                id={id}
                name={id}
                type={type}
                value={value}
                autoComplete={autoComplete}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="
                    h-11 w-full rounded-lg
                    border border-primary-foreground/10
                    bg-background
                    px-4 text-sm text-foreground
                    placeholder:text-muted-foreground
                    outline-none
                    transition-all
                    focus:border-secondary
                    focus:ring-2
                    focus:ring-secondary/30
                "
            />
        </div>
    );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

type PasswordFieldProps = {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    visible: boolean;
    autoComplete?: string;
    onToggle: () => void;
    onChange: (value: string) => void;
};

function PasswordField({
    id,
    label,
    placeholder,
    value,
    visible,
    autoComplete,
    onToggle,
    onChange,
}: PasswordFieldProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="text-sm font-medium text-primary-foreground/90"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className="
                        h-11 w-full rounded-lg
                        border border-primary-foreground/10
                        bg-background
                        px-4 pr-11 text-sm text-foreground
                        placeholder:text-muted-foreground
                        outline-none
                        transition-all
                        focus:border-secondary
                        focus:ring-2
                        focus:ring-secondary/30
                    "
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="
                        absolute right-0 top-0 flex h-11 w-11
                        items-center justify-center
                        text-muted-foreground
                        transition-colors
                        hover:text-foreground
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-ring
                    "
                    aria-label={
                        visible ? "Hide password" : "Show password"
                    }
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
}

/* =========================================================
   SUBMIT BUTTON
========================================================= */

type SubmitButtonProps = {
    label: string;
    loading: boolean;
};

function SubmitButton({ label, loading }: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="
                inline-flex h-11 w-full items-center
                justify-center rounded-lg
                bg-secondary
                px-4 text-sm font-semibold
                text-secondary-foreground
                transition-all duration-200
                hover:bg-secondary/90
                active:scale-[0.99]
                disabled:pointer-events-none
                disabled:opacity-60
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
                focus-visible:ring-offset-2
                focus-visible:ring-offset-primary
            "
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span
                        className="
                            h-4 w-4 animate-spin rounded-full
                            border-2 border-secondary-foreground/30
                            border-t-secondary-foreground
                        "
                    />
                    Please wait...
                </span>
            ) : (
                label
            )}
        </button>
    );
}

/* =========================================================
   SOCIAL LOGIN
========================================================= */

type SocialLoginProps = {
    mode: AuthMode;
};

function SocialLogin({ mode }: SocialLoginProps) {
    return (
        <div className="pt-2">
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-primary-foreground/10" />

                <span className="relative bg-primary px-3 text-xs text-primary-foreground/50">
                    {mode === "signin"
                        ? "Or continue with"
                        : "Or sign up with"}
                </span>
            </div>

            <div className="mt-4 flex justify-center gap-3">
                <button
                    type="button"
                    aria-label="Continue with Google"
                    className="
                        flex h-10 w-10 items-center justify-center
                        rounded-full border border-border
                        bg-background
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-muted
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-ring
                    "
                >
                    <GoogleIcon />
                </button>

                <button
                    type="button"
                    aria-label="Continue with Apple"
                    className="
                        flex h-10 w-10 items-center justify-center
                        rounded-full border border-border
                        bg-background
                        text-foreground
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-muted
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-ring
                    "
                >
                    <AppleIcon />
                </button>
            </div>
        </div>
    );
}

/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="#4285F4"
                d="M21.35 12.27c0-.71-.06-1.39-.18-2.04H12v3.86h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.18Z"
            />

            <path
                fill="#34A853"
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.5Z"
            />

            <path
                fill="#FBBC05"
                d="M6.54 13.61a5.86 5.86 0 0 1 0-3.22V7.88H3.3a9.75 9.75 0 0 0 0 8.24l3.24-2.51Z"
            />

            <path
                fill="#EA4335"
                d="M12 6.36c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.46 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.38l3.24 2.51C7.31 8.08 9.46 6.36 12 6.36Z"
            />
        </svg>
    );
}

/* =========================================================
   APPLE ICON
========================================================= */

function AppleIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M17.05 12.54c.02-1.83 1-3.22 2.92-4.24-1.08-1.55-2.7-2.4-4.84-2.57-2.03-.16-4.25 1.18-5.05 1.18-.85 0-2.81-1.12-4.52-1.12-3.5.06-6.22 2.55-6.22 7.03 0 1.32.24 2.68.72 4.08.64 1.83 2.95 6.32 5.36 6.25 1.26-.03 2.15-.9 3.98-.9 1.77 0 2.58.9 3.99.9 2.43-.04 4.52-4.12 5.13-5.96-3.27-1.54-3.47-4.59-3.47-4.65ZM13.91 3.8c1.56-1.85 1.42-3.53 1.37-4.02-1.38.08-2.97.94-3.88 2.02-.99 1.1-1.57 2.46-1.44 3.99 1.49.11 2.86-.65 3.95-1.99Z" />
        </svg>
    );
}
