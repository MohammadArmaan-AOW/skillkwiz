"use client";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock3, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
const slots = ["09:30 AM", "11:30 AM", "02:00 PM", "04:30 PM"];
export default function ScheduleAssessment() {
    const router = useRouter();
    const params = useSearchParams();
    const [company, setCompany] = useState(
        params.get("company") ?? "Microsoft",
    );
    const [slot, setSlot] = useState("11:30 AM");
    const [submitted, setSubmitted] = useState(params.get("submitted") === "1");
    const selectCompany = (value: string) => {
        setCompany(value);
        router.replace(`/services/employee/schedule?company=${value}`, {
            scroll: false,
        });
    };
    return (
        <div className="space-y-6">
            {params.get("registered") === "1" && (
                <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
                >
                    Profile saved. Choose a suitable assessment appointment.
                </motion.p>
            )}
            <section>
                <h2 className="font-semibold">Choose an invitation</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    You have active assessment invitations from these employers.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {["Microsoft", "Google", "Amazon"].map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => selectCompany(name)}
                            className={`rounded-xl border p-4 text-left transition ${company === name ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                        >
                            <span className="block font-semibold">{name}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                                Skills assessment invitation
                            </span>
                        </button>
                    ))}
                </div>
            </section>
            <div className="rounded-xl border border-border bg-muted/35 p-4">
                <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">
                        <strong className="text-foreground">{company}</strong>{" "}
                        has authorized an assessment covering C#, SQL Server,
                        Web 2.0, and React.
                    </p>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                        Testing centre
                    </span>
                    <span className="relative block">
                        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <select className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm">
                            <option>Indiranagar, Bangalore</option>
                            <option>Koramangala, Bangalore</option>
                        </select>
                    </span>
                </label>
                <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                        Assessment date
                    </span>
                    <span className="relative block">
                        <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            required
                            type="date"
                            className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
                        />
                    </span>
                </label>
            </div>
            <section>
                <h2 className="font-semibold">Choose a time</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {slots.map((time) => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => setSlot(time)}
                            className={`rounded-lg border px-3 py-3 text-sm font-medium ${slot === time ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}
                        >
                            <Clock3 className="mr-1.5 inline size-3.5" />
                            {time}
                        </button>
                    ))}
                </div>
            </section>
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/services/employee/register")}
                >
                    Back
                </Button>
                <Button
                    type="button"
                    onClick={() => {
                        setSubmitted(true);
                        router.replace(
                            `/services/employee/schedule?company=${company}&submitted=1`,
                            { scroll: false },
                        );
                    }}
                >
                    Confirm appointment
                </Button>
            </div>
            {submitted && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-primary/20 bg-primary/10 p-4"
                >
                    <h2 className="font-semibold text-primary">
                        Appointment confirmed
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your {company} assessment is reserved for the selected
                        date at {slot}.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
