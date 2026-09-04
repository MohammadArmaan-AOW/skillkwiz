"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Play,
    Sparkles,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion-reveal";
import { values } from "@/lib/data/about";

export default function AboutPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const handlePlay = async () => {
        try {
            await videoRef.current?.play();
        } catch (error) {
            console.error("Unable to play video:", error);
        }
    };

    return (
        <div className="overflow-hidden bg-background text-foreground">
            <section className="relative isolate border-b border-border/60 pt-24 sm:pt-28">
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_12%,hsl(var(--primary)/.24),transparent_28%),radial-gradient(circle_at_10%_90%,hsl(var(--secondary)/.12),transparent_25%)]" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.35)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-16 lg:pt-14">
                    <Reveal>
                        <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                            <Sparkles className="size-3.5" /> About SkillKwiz
                        </div>
                        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                            Skill intelligence for decisions that{" "}
                            <span className="text-primary">
                                move people forward.
                            </span>
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                            SkillKwiz helps teams see beyond the résumé with
                            assessment experiences built for clarity,
                            confidence, and growth.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full px-5 shadow-lg shadow-primary/20"
                            >
                                <Link href="/services">
                                    Explore our solutions{" "}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full bg-background/60 px-5"
                            >
                                <Link href="#our-story">Our story</Link>
                            </Button>
                        </div>
                        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                            {[
                                "Built around real-world skills",
                                "Designed for better outcomes",
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle2 className="size-4 text-primary" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </Reveal>
                    <Reveal
                        delay={0.12}
                        className="relative mx-auto w-full max-w-md lg:max-w-none"
                    >
                        <div className="absolute -inset-5 -z-10 rounded-full bg-primary/15 blur-3xl" />
                        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-2 shadow-2xl shadow-primary/10">
                            <Image
                                src="/images/aboutpage/aboutus_whoweare.png"
                                alt="SkillKwiz team collaborating"
                                width={760}
                                height={600}
                                priority
                                className="aspect-[1.15/1] w-full rounded-xl object-cover"
                            />
                            <div className="absolute bottom-5 left-5 rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-white shadow-lg backdrop-blur-md dark:bg-background/80">
                                <p className="text-xs font-medium uppercase tracking-wider text-white/65">
                                    A clearer signal
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    For every next step in talent.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section
                className="py-12 sm:py-16"
                aria-labelledby="values-heading"
            >
                <div className="mx-auto max-w-6xl px-5 sm:px-6">
                    <Reveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold text-secondary uppercase tracking-wide">
                                What guides us
                            </p>
                            <h2
                                id="values-heading"
                                className="mt-1 text-3xl text-primary font-semibold tracking-tight sm:text-4xl"
                            >
                                The principles behind the platform.
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-muted-foreground">
                            Every experience is shaped to bring more humanity
                            and evidence into the way talent is understood.
                        </p>
                    </Reveal>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {values.map(
                            (
                                { title, description, image, icon: Icon },
                                index,
                            ) => (
                                <Reveal key={title} delay={index * 0.08}>
                                    <article className="group h-full rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/35 hover:bg-primary/[.035]">
                                        <div className="flex items-start justify-between">
                                        
                                            <div className="flex items-center justify-center p-1 bg-primary/20 rounded-lg">

                                            <Image
                                                src={image}
                                                alt=""
                                                width={80}
                                                height={80}
                                                className="size-16 object-contain transition-transform duration-300 group-hover:scale-110"
                                                />
                                                </div>
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold capitalize">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {description}
                                        </p>
                                    </article>
                                </Reveal>
                            ),
                        )}
                    </div>
                </div>
            </section>

            <section
                id="our-story"
                className="border-y border-border/60 bg-muted/35 py-12 sm:py-16"
            >
                <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-2 lg:items-center">
                    <Reveal className="order-2 lg:order-1">
                        <p className="text-sm font-semibold text-secondary uppercase tracking-wide">
                            Who we are
                        </p>
                        <h2 className="mt-1 text-3xl text-primary font-semibold tracking-tight sm:text-4xl">
                            Your partner in skill assessment.
                        </h2>
                        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
                            We quantify skills so organizations can recognize
                            capability, build stronger teams, and make the next
                            decision with useful context—not guesswork.
                        </p>
                        <blockquote className="mt-5 border-l-2 border-primary pl-4 text-sm leading-6 text-foreground/85">
                            “SkillKwiz has a single purpose: to create
                            stakeholder value through meaningful skill
                            intelligence.”
                            <footer className="mt-2 font-medium text-foreground">
                                — Venugopal B A, CEO
                            </footer>
                        </blockquote>
                    </Reveal>
                    <Reveal
                        delay={0.1}
                        className="order-1 grid grid-cols-3 gap-2 lg:order-2"
                    >
                        {[
                            "about_who_we_are-0.png",
                            "about_who_we_are-1.png",
                            "about_who_we_are-2.png",
                        ].map((file, index) => (
                            <motion.div
                                key={file}
                                whileHover={{ y: -5 }}
                                className={cn(
                                    "overflow-hidden rounded-xl border border-border bg-card",
                                    index === 1 && "translate-y-5",
                                )}
                            >
                                <Image
                                    src={`/images/aboutpage/${file}`}
                                    alt="People collaborating at SkillKwiz"
                                    width={240}
                                    height={420}
                                    className="h-52 w-full object-cover sm:h-72"
                                />
                            </motion.div>
                        ))}
                    </Reveal>
                </div>
            </section>

            <section
                className="py-12 sm:py-16"
                aria-labelledby="leadership-heading"
            >
                <div className="mx-auto grid max-w-6xl gap-7 px-5 sm:px-6 lg:grid-cols-[.68fr_1.32fr] lg:items-center">
                    <Reveal className="mx-auto w-full max-w-xs lg:mx-0">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm">
                            <Image
                                src="/images/aboutpage/Venugopal.png"
                                alt="Venugopal B A, CEO of SkillKwiz"
                                width={440}
                                height={440}
                                className="aspect-square w-full rounded-xl object-cover object-top"
                            />
                            <div className="px-2 pb-1 pt-3 flex items-center justify-center flex-col">
                                <p className="font-semibold">Venugopal B A</p>
                                <p className="text-sm text-primary">
                                    Chief Executive Officer (CEO)
                                </p>
                            </div>
                        </div>
                    </Reveal>
                    
                    <Reveal delay={0.1}>
                        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
                            Leadership
                        </p>
                        <h2
                            id="leadership-heading"
                            className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl text-primary"
                        >
                            Built on experience. Focused on what&apos;s next.
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                            <p>
                                With 24 years in IT and senior leadership,
                                Venugopal B A brings firsthand insight into one
                                of the services sector’s most persistent
                                challenges: understanding the skills people can
                                truly bring to the work.
                            </p>
                            <p>
                                His vision is to make SkillKwiz an AI-first
                                company shaped by the needs of the market it
                                serves—one where evidence helps talent and
                                organizations grow together.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section
                className="border-t border-border/60 bg-muted/35 py-12 sm:py-16"
                aria-labelledby="film-heading"
            >
                <div className="mx-auto max-w-5xl px-5 sm:px-6">
                    <Reveal className="mb-5 text-center">
                        <p className="text-sm font-semibold text-secondary tracking-wide uppercase">
                            Inside SkillKwiz
                        </p>
                        <h2
                            id="film-heading"
                            className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl text-primary"
                        >
                            See our purpose in motion.
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-xl shadow-black/5">
                            <video
                                ref={videoRef}
                                className="aspect-video w-full rounded-xl bg-muted object-cover"
                                controls
                                preload="metadata"
                                poster="/images/aboutpage/thumbnail.png"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                            >
                                <source
                                    src="/images/aboutpage/about_video.mp4"
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                            {!isPlaying && (
                                <button
                                    type="button"
                                    onClick={handlePlay}
                                    aria-label="Play SkillKwiz video"
                                    className="absolute inset-1 flex items-center justify-center rounded-xl bg-background/10 transition-colors hover:bg-background/20"
                                >
                                    <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-110">
                                        <Play
                                            className="ml-0.5 size-6"
                                            fill="currentColor"
                                        />
                                    </span>
                                </button>
                            )}
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
