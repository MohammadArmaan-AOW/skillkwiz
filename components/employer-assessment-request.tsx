"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CreditCard, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
const input =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
const skills = ["Python", "React", "SQL", "Java", "C#", "Communication"];
export default function EmployerAssessmentRequest() {
    const router = useRouter();
    const [selected, setSelected] = useState(["Python", "React"]);
    const [success, setSuccess] = useState(false);
    const toggle = (skill: string) =>
        setSelected((current) =>
            current.includes(skill)
                ? current.filter((value) => value !== skill)
                : [...current, skill],
        );
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                setSuccess(true);
            }}
            className="space-y-6"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <Field
                    label="Candidate first name"
                    placeholder="First name"
                    required
                />
                <Field
                    label="Candidate last name"
                    placeholder="Last name"
                    required
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field
                    label="Candidate email"
                    type="email"
                    placeholder="candidate@example.com"
                    required
                />
                <Field
                    label="Candidate phone"
                    type="tel"
                    placeholder="Phone number"
                    required
                />
            </div>
            <label className="block">
                <span className="mb-2 block text-sm font-medium">
                    Candidate ID type
                </span>
                <select className={input}>
                    <option>PAN card</option>
                    <option>Aadhaar card</option>
                    <option>Passport</option>
                </select>
            </label>
            <section>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h2 className="font-semibold">Build the assessment</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Select the skills you want to evaluate.
                        </p>
                    </div>
                    <span className="text-sm font-medium text-primary">
                        {selected.length} selected
                    </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => toggle(skill)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${selected.includes(skill) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}
                        >
                            {selected.includes(skill) && (
                                <CheckCircle2 className="mr-1 inline size-3.5" />
                            )}
                            {skill}
                        </button>
                    ))}
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground"
                    >
                        <Plus className="size-3.5" /> Custom skill
                    </button>
                </div>
            </section>
            <section className="rounded-xl border border-border bg-muted/35 p-4">
                <div className="flex gap-3">
                    <CreditCard className="mt-0.5 size-5 text-primary" />
                    <div>
                        <h2 className="font-semibold">Assessment payment</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            ₹3,320 (US $40) will be charged to the selected
                            company payment method after you submit this
                            request.
                        </p>
                        <label className="mt-3 block">
                            <span className="mb-2 block text-sm font-medium">
                                Payment method
                            </span>
                            <select className={input}>
                                <option>ICICI •••• 4821</option>
                                <option>Add payment method</option>
                            </select>
                        </label>
                    </div>
                </div>
            </section>
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit">Pay & send assessment</Button>
            </div>
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
                    >
                        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
                            <CheckCircle2 className="mx-auto size-11 text-primary" />
                            <h2 className="mt-3 text-xl font-semibold">
                                Assessment sent
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                The candidate will receive an invitation and
                                your payment is captured in this frontend
                                preview.
                            </p>
                            <Button
                                className="mt-5"
                                onClick={() =>
                                    router.push(
                                        "/services/employer/candidates?request=sent",
                                    )
                                }
                            >
                                View candidates
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );
}
function Field({
    label,
    ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>
            <input className={input} {...props} />
        </label>
    );
}
