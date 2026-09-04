"use client";
import { useRouter } from "next/navigation";
import { useState, type InputHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
const input =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
export default function EmployerRegistration() {
    const router = useRouter();
    const [canPay, setCanPay] = useState("yes");
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                router.push("/services/employer/profile?registered=1");
            }}
            className="space-y-5"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" placeholder="First name" required />
                <Field label="Last name" placeholder="Last name" required />
            </div>
            <Field
                label="Work email"
                type="email"
                placeholder="you@company.com"
                required
            />
            <Field label="Company" placeholder="Company name" required />
            <Field
                label="Phone"
                type="tel"
                placeholder="Your phone number"
                required
            />
            <label className="block">
                <span className="mb-2 block text-sm font-medium">
                    Department
                </span>
                <select className={input} defaultValue="Human resources">
                    <option>Human resources</option>
                    <option>Talent acquisition</option>
                    <option>People operations</option>
                    <option>Engineering</option>
                </select>
            </label>
            <fieldset>
                <legend className="mb-2 text-sm font-medium">
                    Authorized to pay for assessments?
                </legend>
                <div className="grid grid-cols-2 gap-3">
                    {["yes", "no"].map((option) => (
                        <label
                            key={option}
                            className={`cursor-pointer rounded-lg border px-3 py-3 text-sm font-medium capitalize ${canPay === option ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                        >
                            <input
                                className="sr-only"
                                type="radio"
                                value={option}
                                checked={canPay === option}
                                onChange={() => setCanPay(option)}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            </fieldset>
            {canPay === "yes" && (
                <Field
                    label="Authorization details"
                    placeholder="e.g. Cost centre owner"
                    required
                />
            )}
            <div className="flex justify-end gap-3">
                <Button type="reset" variant="outline">
                    Reset
                </Button>
                <Button type="submit">Create employer workspace</Button>
            </div>
        </form>
    );
}
function Field({
    label,
    ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>
            <input className={input} {...props} />
        </label>
    );
}
