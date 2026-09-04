"use client";
import { motion } from "framer-motion";
import { FileUp, Mail, Phone, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type InputHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
const input =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
export default function EmployeeRegistration() {
    const router = useRouter();
    const [emailOtp, setEmailOtp] = useState(false);
    const [phoneOtp, setPhoneOtp] = useState(false);
    const [fileName, setFileName] = useState("");
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                router.push("/services/employee/schedule?registered=1");
            }}
            className="space-y-5"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" name="name" placeholder="First name" required />
                <Field label="Last name" name="name"  placeholder="Last name" required />
            </div>
            <Verification
                label="Email"
                icon={Mail}
                name="email" 
                type="email"
                placeholder="you@example.com"
                showOtp={emailOtp}
                onOtp={() => setEmailOtp(true)}
            />
            <Verification
                label="Phone"
                icon={Phone}
                name='tel'
                type="tel"
                placeholder="Your phone number"
                showOtp={phoneOtp}
                onOtp={() => setPhoneOtp(true)}
            />
            <label className="block">
                <span className="mb-2 block text-sm font-medium">
                    Résumé{" "}
                    <span className="text-muted-foreground">(optional)</span>
                </span>
                <span className="flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-muted/35 px-4 transition hover:border-primary/50">
                    <FileUp className="size-5 text-primary" />
                    <span>
                        <span className="block text-sm font-medium">
                            {fileName || "Upload your résumé"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            PDF, DOC, or DOCX
                        </span>
                    </span>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(event) =>
                            setFileName(event.target.files?.[0]?.name ?? "")
                        }
                    />
                </span>
            </label>
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />{" "}
                Your details are used only to set up this assessment workspace.
            </div>
            <div className="flex flex-wrap justify-end gap-3">
                <Button type="reset" variant="outline">
                    Reset
                </Button>
                <Button type="submit">Continue to scheduling</Button>
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
function Verification({
    label,
    icon: Icon,
    showOtp,
    onOtp,
    ...props
}: {
    label: string;
    icon: typeof Mail;
    showOtp: boolean;
    onOtp: () => void;
} & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="block">
                <span className="mb-2 block text-sm font-medium">{label}</span>
                <span className="flex">
                    <span className="relative flex-1">
                        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            className={`${input} rounded-r-none pl-9`}
                            {...props}
                        />
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onOtp}
                        className="h-11 rounded-l-none border-l-0"
                    >
                        Get OTP
                    </Button>
                </span>
            </label>
            {showOtp && (
                <motion.input
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    required
                    placeholder={`Enter ${label.toLowerCase()} OTP`}
                    className={`${input} mt-2 max-w-52`}
                />
            )}
        </div>
    );
}
