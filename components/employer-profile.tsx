"use client";
import Link from "next/link";
import { Building2, Edit3, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
const profileDetails = [
    { icon: Mail, label: "Email", value: "robert.jane@amazon.com" },
    { icon: Phone, label: "Phone", value: "+91 63801 01407" },
    { icon: Building2, label: "Department", value: "Human Resources" },
];
export default function EmployerProfile() {
    return (
        <div>
            <div className="flex flex-col gap-5 rounded-xl border border-border bg-muted/30 p-5 sm:flex-row sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
                    RJ
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-primary">
                        Employer profile
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">Robert Jane</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Amazon · Human Resources
                    </p>
                </div>
                <Button variant="outline" className="w-fit">
                    <Edit3 className="size-4" /> Edit profile
                </Button>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                {profileDetails.map(({ icon: Icon, label, value }) => (
                    <div
                        key={label}
                        className="rounded-xl border border-border p-4"
                    >
                        <Icon className="size-4 text-primary" />
                        <dt className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {label}
                        </dt>
                        <dd className="mt-1 text-sm font-medium">{value}</dd>
                    </div>
                ))}
            </dl>
            <div className="mt-6 flex justify-end">
                <Button asChild>
                    <Link href="/services/employer/assessments/new">
                        Create assessment
                    </Link>
                </Button>
            </div>
        </div>
    );
}
