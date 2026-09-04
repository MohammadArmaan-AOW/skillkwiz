"use client";
import { motion } from "framer-motion";
import { Download, MapPin, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
const candidates = [
    {
        name: "K. Pradeep Kishor",
        initials: "PK",
        skills: ["C#", "Java", "SQL"],
        score: 85,
        location: "Bangalore",
    },
    {
        name: "Manoj Kumar",
        initials: "MK",
        skills: ["Python", "React", "SQL"],
        score: 82,
        location: "Chennai",
    },
    {
        name: "Kasiro Das",
        initials: "KD",
        skills: ["Java", "C#"],
        score: 79,
        location: "Bangalore",
    },
    {
        name: "Ravi Shankar",
        initials: "RS",
        skills: ["Python", "SQL"],
        score: 76,
        location: "Hyderabad",
    },
];
export default function EmployerCandidateList() {
    const [query, setQuery] = useState("");
    const [skill, setSkill] = useState("All skills");
    const searchParams = useSearchParams();
    const results = useMemo(
        () =>
            candidates.filter(
                (candidate) =>
                    `${candidate.name} ${candidate.location} ${candidate.skills.join(" ")}`
                        .toLowerCase()
                        .includes(query.toLowerCase()) &&
                    (skill === "All skills" ||
                        candidate.skills.includes(skill)),
            ),
        [query, skill],
    );
    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search name, skill, or location"
                        className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </label>
                <select
                    value={skill}
                    onChange={(event) => setSkill(event.target.value)}
                    className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option>All skills</option>
                    <option>Python</option>
                    <option>React</option>
                    <option>Java</option>
                    <option>C#</option>
                    <option>SQL</option>
                </select>
            </div>
            {searchParams.get("request") === "sent" && (
                <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                    Assessment request sent. Track the candidate here as results
                    arrive.
                </p>
            )}
            <p className="mt-5 text-sm text-muted-foreground">
                {results.length} candidates
            </p>
            <div className="mt-3 space-y-3">
                {results.map((candidate, index) => (
                    <motion.article
                        key={candidate.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                    >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {candidate.initials}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold">{candidate.name}</h2>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                <span>{candidate.skills.join(" · ")}</span>
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="size-3.5" />
                                    {candidate.location}
                                </span>
                            </div>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-lg font-semibold text-primary">
                                {candidate.score}
                                <span className="text-xs text-muted-foreground">
                                    th percentile
                                </span>
                            </p>
                            <a
                                href="/downloads/dummy-candidate-report.pdf"
                                download
                                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                                <Download className="size-3.5" /> Report
                            </a>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    );
}
