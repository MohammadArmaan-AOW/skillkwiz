"use client";

import { motion } from "framer-motion";
import {
    CheckCircle2,
    ClipboardCheck,
    ArrowLeft,
    LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssessmentSubmittedPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="w-full"
                >
                    <div className="mx-auto max-w-2xl text-center">
                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 0.45,
                                delay: 0.1,
                                ease: "easeOut",
                            }}
                            className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
                        >
                            <CheckCircle2 className="h-10 w-10 text-primary" />
                        </motion.div>

                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.2,
                            }}
                        >
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                                Assessment Complete
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Assessment Submitted Successfully
                            </h1>

                            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                                Your assessment responses have been submitted
                                successfully. Thank you for completing the
                                assessment.
                            </p>
                        </motion.div>

                        {/* Confirmation Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.3,
                            }}
                            className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card p-6 text-left sm:p-7"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        Your responses have been received
                                    </h2>

                                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                        Your submission has been recorded and is
                                        now available for review by the
                                        employer.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-border pt-5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        Submission status
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Submitted
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Result Information */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.4,
                            }}
                            className="mx-auto mt-5 max-w-xl"
                        >
                            <p className="text-sm leading-6 text-muted-foreground">
                                Your assessment results are not available at
                                this time. The employer will review your
                                submission and share the results if they become
                                available.
                            </p>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.5,
                            }}
                            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/services/employee/assessments",
                                    )
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                My Assessments
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/services/employee/assignments")
                                }
                                className="primary-gradient inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
