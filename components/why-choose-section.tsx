"use client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CARDS, CardType } from "@/lib/data/why-choose-us";

const CARD_POSITIONS: Record<
    CardType,
    {
        base: string;
        rotate: number;
        z: number;
    }
> = {
    library: {
        base: "left-[calc(50%-280px)] top-4",
        rotate: -10,
        z: 10,
    },

    secure: {
        base: "left-[calc(50%-130px)] top-0",
        rotate: 0,
        z: 20,
    },

    pricing: {
        base: "right-[calc(50%-280px)] top-4",
        rotate: 10,
        z: 10,
    },
};

export default function WhyChooseSection() {
    const [activeCard, setActiveCard] = useState<CardType | null>(null);

    const prefersReducedMotion = useReducedMotion();

    const getCardState = (card: CardType) => {
        if (activeCard === null) {
            return "normal";
        }

        return activeCard === card ? "active" : "inactive";
    };

    const container = {
        hidden: {},

        show: {
            transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.15,

                delayChildren: prefersReducedMotion ? 0 : 0.1,
            },
        },
    };

    const headingItem = {
        hidden: {
            opacity: 0,
            y: prefersReducedMotion ? 0 : 16,
        },

        show: {
            opacity: 1,
            y: 0,

            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    return (
        <section className="relative overflow-hidden bg-background py-16 text-primary-foreground sm:py-20 lg:py-24">
            {/* =====================================================
                BACKGROUND IMAGES
            ====================================================== */}

            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <div className="absolute inset-x-0 top-0 h-[35%]">
                    <Image
                        src="/images/homepage/why_choose_banner_2.png"
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>

                <div className="absolute inset-x-0 bottom-0 h-[45%]">
                    <Image
                        src="/images/homepage/why_choose_banner_2.png"
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                            src="/images/homepage/home_globe.gif"
                            alt=""
                            width={700}
                            height={700}
                            className="w-full max-w-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{
                    once: true,
                    amount: 0.3,
                }}
                className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-12"
            >
                {/* =================================================
                    HEADING
                ================================================== */}

                <motion.div
                    variants={headingItem}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Why Choose{" "}
                        <span className="text-secondary">SkillKwiz</span>?
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-6 text-primary-foreground/75 sm:text-base sm:leading-7">
                        Discover our unique value propositions designed to
                        enhance your recruitment strategy.
                        <br />
                        Experience the difference SkillKwiz can make in your
                        organization.
                    </p>
                </motion.div>

                {/* =================================================
                    MOBILE SLIDER
                ================================================== */}

                <MobileSlider
                    container={container}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* =================================================
                    DESKTOP CARDS
                ================================================== */}

                <div
                    className="relative mt-14 hidden h-[410px] md:block"
                    onMouseLeave={() => setActiveCard(null)}
                >
                    {(["library", "secure", "pricing"] as CardType[]).map(
                        (card, i) => {
                            const pos = CARD_POSITIONS[card];

                            const state = getCardState(card);

                            return (
                                <motion.div
                                    key={card}
                                    variants={headingItem}
                                    custom={i}
                                    onMouseEnter={() => setActiveCard(card)}
                                    onFocus={() => setActiveCard(card)}
                                    onClick={() => setActiveCard(card)}
                                    tabIndex={0}
                                    role="button"
                                    aria-pressed={state === "active"}
                                    animate={
                                        prefersReducedMotion
                                            ? undefined
                                            : {
                                                  y:
                                                      state === "active"
                                                          ? -32
                                                          : state === "inactive"
                                                            ? 32
                                                            : 0,

                                                  scale:
                                                      state === "active"
                                                          ? 1.04
                                                          : state === "inactive"
                                                            ? 0.96
                                                            : 1,

                                                  rotate:
                                                      state === "active"
                                                          ? pos.rotate * 0.15
                                                          : pos.rotate,

                                                  opacity:
                                                      state === "inactive"
                                                          ? 0.85
                                                          : 1,
                                              }
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 22,
                                    }}
                                    className={cn(
                                        "absolute h-[350px] w-64 cursor-pointer rounded-2xl border p-6 text-card-foreground",
                                        "bg-card transition-colors duration-300",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
                                        pos.base,

                                        state === "active"
                                            ? [
                                                  "z-30",
                                                  "border-secondary/60",
                                                  "shadow-[0_20px_50px_-20px_hsl(var(--secondary)/.35)]",
                                              ]
                                            : "border-border/50",

                                        prefersReducedMotion &&
                                            (state === "active"
                                                ? "z-30 -translate-y-8 scale-[1.03]"
                                                : state === "inactive"
                                                  ? "z-10 translate-y-8 scale-[0.96] opacity-85"
                                                  : `z-${pos.z} rotate-[${pos.rotate}deg]`),
                                    )}
                                    style={
                                        prefersReducedMotion
                                            ? {
                                                  transform: `rotate(${pos.rotate}deg)`,
                                                  zIndex: pos.z,
                                              }
                                            : undefined
                                    }
                                >
                                    {/* =================================================
                                    ACTIVE CARD INTERNAL HIGHLIGHT
                                ================================================== */}

                                    <AnimatePresence>
                                        {state === "active" && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                }}
                                                aria-hidden="true"
                                                className="
                                                pointer-events-none
                                                absolute
                                                inset-0
                                                rounded-2xl
                                                bg-gradient-to-br
                                                from-secondary/12
                                                via-transparent
                                                to-primary/8
                                            "
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* =================================================
                                    CARD CONTENT
                                ================================================== */}

                                    <div className="relative z-10">
                                        <CardContent
                                            card={
                                                CARDS.find(
                                                    (c) => c.id === card,
                                                ) ?? CARDS[i]
                                            }
                                        />
                                    </div>
                                </motion.div>
                            );
                        },
                    )}
                </div>

                {/* =================================================
                    CTA
                ================================================== */}

                <motion.div
                    variants={headingItem}
                    className="relative z-20 mt-12 text-center sm:mt-16"
                >
                    <h3 className="text-2xl font-bold sm:text-3xl">
                        Join the Talent Revolution
                    </h3>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/75 sm:text-base">
                        Take the first step towards transforming your hiring
                        process. Make selections in line with our tried and
                        tested platform.
                    </p>

                    <Button
                        asChild
                        size="lg"
                        className="mt-7 border-0 bg-secondary text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-secondary/90 hover:opacity-90 active:scale-[0.98]"
                    >
                        <Link href="/services">Get Started</Link>
                    </Button>
                </motion.div>
            </motion.div>
        </section>
    );
}

/* =====================================================
   MOBILE SLIDER
===================================================== */

function MobileSlider({
    container,
    prefersReducedMotion,
}: {
    container: Record<string, unknown>;
    prefersReducedMotion: boolean | null;
}) {
    const trackRef = useRef<HTMLDivElement>(null);

    const cardRefs = useRef<(HTMLElement | null)[]>([]);

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const track = trackRef.current;

        if (!track) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                        const index = cardRefs.current.findIndex(
                            (el) => el === entry.target,
                        );

                        if (index !== -1) {
                            setActiveIndex(index);
                        }
                    }
                });
            },
            {
                root: track,
                threshold: [0.6],
            },
        );

        cardRefs.current.forEach((el) => el && observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <motion.div variants={container as never} className="mt-10 md:hidden">
            <div
                ref={trackRef}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-none"
                aria-label="Why choose SkillKwiz"
            >
                {CARDS.map((card, i) => (
                    <motion.article
                        key={card.id}
                        ref={(el) => {
                            cardRefs.current[i] = el;
                        }}
                        initial={{
                            opacity: 0,
                            y: prefersReducedMotion ? 0 : 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.5,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="
                            w-[82vw]
                            max-w-sm
                            shrink-0
                            snap-center
                            rounded-2xl
                            border
                            border-border/50
                            bg-card
                            p-6
                            text-card-foreground
                        "
                    >
                        <CardContent card={card} />
                    </motion.article>
                ))}
            </div>

            {/* =================================================
                MOBILE INDICATORS
            ================================================== */}

            <div className="mt-3 flex justify-center gap-2">
                {CARDS.map((card, index) => (
                    <span
                        key={card.id}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",

                            index === activeIndex
                                ? "w-8 bg-primary-gradient"
                                : "w-1.5 bg-primary-foreground/40",
                        )}
                    />
                ))}
            </div>
        </motion.div>
    );
}

/* =====================================================
   SHARED CARD CONTENT
===================================================== */

function CardContent({
    card,
}: {
    card: {
        title: string;
        description: string;
        image: string;
        alt: string;
    };
}) {
    return (
        <>
            {/* =================================================
                CARD ICON
            ================================================== */}

            <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/30 ring-1 ring-border/40 transition-transform duration-300">
                    <Image
                        src={card.image}
                        alt={card.alt}
                        width={80}
                        height={80}
                        loading="lazy"
                        className="h-20 w-20 object-cover"
                        style={{
                            width: "auto",
                            height: "auto",
                        }}
                    />
                </div>
            </div>

            {/* =================================================
                CARD TITLE
            ================================================== */}

            <h3 className="text-center text-xl font-bold uppercase tracking-wide text-primary-gradient">
                {card.title}
            </h3>

            {/* =================================================
                TITLE DIVIDER
            ================================================== */}

            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-primary-gradient" />

            {/* =================================================
                CARD DESCRIPTION
            ================================================== */}

            <p className="mt-4 text-center text-xs leading-6 text-muted-foreground text-wrap">
                {card.description}
            </p>
        </>
    );
}
