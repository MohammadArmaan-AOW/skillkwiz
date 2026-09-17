"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CARDS } from "@/lib/data/why-choose-us";

export default function WhyChooseSection() {
    const prefersReducedMotion = useReducedMotion();

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section
            className="
                relative
                isolate
                min-h-screen
                overflow-hidden
                bg-background
                text-foreground
            "
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    -z-20
                    overflow-hidden
                "
                aria-hidden="true"
            >
                {/* Main theme glow */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-0
                        h-[500px]
                        w-[500px]
                        -translate-x-1/2
                        rounded-full
                        bg-primary/10
                        blur-[120px]
                    "
                />

                {/* Secondary glow */}
                <div
                    className="
                        absolute
                        bottom-0
                        left-0
                        h-[400px]
                        w-[400px]
                        rounded-full
                        bg-secondary/10
                        blur-[120px]
                    "
                />

                {/* Right glow */}
                <div
                    className="
                        absolute
                        right-0
                        top-1/3
                        h-[350px]
                        w-[350px]
                        rounded-full
                        bg-primary/5
                        blur-[100px]
                    "
                />

                {/* Subtle grid */}
                <div
                    className="
                        absolute
                        inset-0
                        opacity-[0.035]
                        [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)]
                        [background-size:48px_48px]
                    "
                />

                {/* =================================================
                    CENTER GLOBE
                ================================================== */}

                <motion.div
                    initial={false}
                    animate={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  scale: [0.98, 1.02, 0.98],
                                  opacity: [0.2, 0.28, 0.2],
                              }
                    }
                    transition={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  duration: 8,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                              }
                    }
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        -z-10
                        aspect-square
                        w-[min(125vw,1000px)]
                        -translate-x-1/2
                        -translate-y-1/2
                    "
                >
                </motion.div>

                {/* Globe halo */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        -z-10
                        aspect-square
                        w-[min(82vw,700px)]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        border
                        border-primary/10
                        shadow-[0_0_100px_hsl(var(--primary)/.08)]
                        sm:h-[750px]
                        sm:w-[750px]
                        md:h-[850px]
                        md:w-[850px]
                        lg:h-[950px]
                        lg:w-[950px]
                    "
                />
                <Image
                        src="/images/homepage/home_globe.gif"
                        alt=""
                        fill
                        sizes="
                            (max-width: 640px) 125vw,
                            (max-width: 800px) 800px,
                            900px
                        "
                        className="
                            object-contain
                            opacity-30
                        "
                        loading="lazy"
                    />
            </div>

            {/* =====================================================
                CONTENT
            ====================================================== */}

            <div
                className="
                    relative
                    z-10
                    mx-auto
                    flex
                    min-h-screen
                    w-full
                    max-w-7xl
                    flex-col
                    justify-center
                    px-5
                    py-20
                    sm:px-8
                    lg:px-10
                "
            >
                {/* =================================================
                    HEADING
                ================================================== */}

                <motion.div
                    initial={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  opacity: 0,
                                  y: 25,
                              }
                    }
                    whileInView={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  opacity: 1,
                                  y: 0,
                              }
                    }
                    viewport={{
                        once: true,
                        amount: 0.3,
                    }}
                    transition={{
                        duration: 0.7,
                    }}
                    className="
                        mx-auto
                        max-w-3xl
                        text-center
                    "
                >
                    {/* Eyebrow */}
                    <div
                        className="
                            mx-auto
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-primary/20
                            bg-primary/5
                            px-4
                            py-1.5
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.16em]
                            text-primary
                            backdrop-blur-sm
                        "
                    >
                        <span
                            className="
                                h-2
                                w-2
                                rounded-full
                                bg-primary
                                shadow-[0_0_12px_hsl(var(--primary)/.7)]
                            "
                        />

                        Why SkillKwiz
                    </div>

                    <h2
                        className="
                            mt-5
                            text-balance
                            text-3xl
                            font-bold
                            tracking-[-0.04em]
                            sm:text-4xl
                            lg:text-5xl
                            xl:text-6xl
                        "
                    >
                        Why Choose{" "}
                        <span className="text-primary">
                            SkillKwiz?
                        </span>
                    </h2>

                    <p
                        className="
                            mx-auto
                            mt-5
                            max-w-2xl
                            text-pretty
                            text-sm
                            leading-7
                            text-muted-foreground
                            sm:text-base
                            sm:leading-8
                        "
                    >
                        Discover a smarter way to evaluate talent,
                        streamline recruitment, and make confident
                        hiring decisions.
                    </p>
                </motion.div>

                {/* =================================================
                    CARD STAGE
                ================================================== */}

                <div
                    className="
                        relative
                        mx-auto
                        mt-14
                        w-full
                        max-w-6xl
                        sm:mt-16
                    "
                >
                    {/* =================================================
                        MOBILE / TABLET

                        Normal responsive cards.
                        No stacked animation.
                    ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            sm:grid-cols-2
                            lg:hidden
                        "
                    >
                        {CARDS.slice(0, 3).map((card) => (
                            <NormalCard
                                key={card.id}
                                card={card}
                                prefersReducedMotion={
                                    prefersReducedMotion
                                }
                            />
                        ))}
                    </div>

                    {/* =================================================
                        DESKTOP

                        Existing stacked / separated animation.
                    ================================================== */}

                    <div
                        className="
                            relative
                            hidden
                            h-[560px]
                            w-full
                            lg:block
                        "
                        onClick={() =>
                            setIsExpanded((value) => !value)
                        }
                    >
                        {CARDS.slice(0, 3).map(
                            (card, index) => (
                                <AnimatedCard
                                    key={card.id}
                                    card={card}
                                    index={index}
                                    expanded={isExpanded}
                                    prefersReducedMotion={
                                        prefersReducedMotion
                                    }
                                />
                            ),
                        )}
                    </div>
                </div>

                {/* =================================================
                    CTA
                ================================================== */}

                <motion.div
                    initial={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  opacity: 0,
                                  y: 20,
                              }
                    }
                    whileInView={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  opacity: 1,
                                  y: 0,
                              }
                    }
                    viewport={{
                        once: true,
                        amount: 0.3,
                    }}
                    transition={{
                        duration: 0.6,
                    }}
                    className="
                        mx-auto
                        max-w-3xl
                        text-center
                        sm:mt-4
                    "
                >
                    <h3
                        className="
                            text-2xl
                            font-bold
                            tracking-tight
                            sm:text-3xl
                        "
                    >
                        Join the Talent Revolution
                    </h3>

                    <p
                        className="
                            mx-auto
                            mt-3
                            max-w-2xl
                            text-sm
                            leading-7
                            text-muted-foreground
                            sm:text-base
                        "
                    >
                        Take the first step towards transforming
                        your hiring process with SkillKwiz.
                    </p>

                    <Button
                        asChild
                        size="lg"
                        className="
                            mt-7
                            h-11
                            border-0
                            bg-secondary
                            px-7
                            text-white
                            shadow-lg
                            shadow-secondary/20
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:bg-secondary/90
                        "
                    >
                        <Link href="/services">
                            Get Started
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}

/* ================================================================
   DESKTOP ANIMATED CARD
================================================================ */

function AnimatedCard({
    card,
    index,
    expanded,
    prefersReducedMotion,
}: {
    card: {
        id: string;
        title: string;
        description: string;
        image: string;
        alt: string;
    };
    index: number;
    expanded: boolean;
    prefersReducedMotion: boolean | null;
}) {
    /*
     * COLLAPSED:
     *
     *              [1]
     *             [2]
     *              [3]
     *
     * EXPANDED:
     *
     *       [1]    [2]    [3]
     *
     * This behavior is ONLY used on desktop.
     */

    const desktopPositions = [
        {
            collapsed: {
                x: "-50%",
                y: "-50%",
                rotate: -4,
            },
            expanded: {
                x: "-155%",
                y: "-50%",
                rotate: -6,
            },
        },
        {
            collapsed: {
                x: "-50%",
                y: "-50%",
                rotate: 0,
            },
            expanded: {
                x: "-50%",
                y: "-50%",
                rotate: 0,
            },
        },
        {
            collapsed: {
                x: "-50%",
                y: "-50%",
                rotate: 4,
            },
            expanded: {
                x: "55%",
                y: "-50%",
                rotate: 6,
            },
        },
    ];

    const position = desktopPositions[index];

    return (
        <motion.article
            initial={false}
            animate={
                prefersReducedMotion
                    ? position.collapsed
                    : expanded
                      ? position.expanded
                      : position.collapsed
            }
            transition={{
                type: "spring",
                stiffness: 180,
                damping: 24,
                mass: 0.8,
            }}
            whileHover={
                prefersReducedMotion
                    ? undefined
                    : {
                          y: "-54%",
                          scale: 1.035,
                      }
            }
            className="
                absolute
                left-1/2
                top-1/2
                w-[min(82vw,360px)]
                cursor-pointer
                touch-manipulation
                will-change-transform
            "
            style={{
                zIndex: index === 1 ? 30 : 20 - index,
            }}
        >
            <div
                className="
                    group
                    relative
                    min-h-[390px]
                    overflow-hidden
                    rounded-3xl
                    border
                    border-border/70
                    bg-card/95
                    p-6
                    shadow-2xl
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    hover:border-primary/30
                    hover:shadow-[0_25px_80px_hsl(var(--primary)/.14)]
                    sm:min-h-[410px]
                    sm:p-7
                "
            >
                {/* Top highlight */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-x-8
                        top-0
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-primary
                        to-transparent
                        opacity-40
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                    "
                />

                {/* Image */}

                <motion.div
                    whileHover={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  scale: 1.08,
                                  rotate: 5,
                              }
                    }
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                    }}
                    className="
                        relative
                        mx-auto
                        flex
                        h-24
                        w-24
                        overflow-hidden
                        rounded-full
                        border
                        border-primary/20
                        bg-primary/5
                        shadow-[0_0_45px_hsl(var(--primary)/.1)]
                        sm:h-28
                        sm:w-28
                    "
                >
                    <Image
                        src={card.image}
                        alt={card.alt}
                        width={112}
                        height={112}
                        loading="lazy"
                        unoptimized
                        className="
                            h-full
                            w-full
                            object-cover
                        "
                    />
                </motion.div>

                {/* Title */}

                <div className="mt-7 text-center">
                    <h3
                        className="
                            text-xl
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-primary
                            sm:text-2xl
                        "
                    >
                        {card.title}
                    </h3>

                    <div
                        className="
                            mx-auto
                            mt-3
                            h-1
                            w-10
                            rounded-full
                            bg-primary
                            transition-all
                            duration-500
                            group-hover:w-20
                            group-hover:bg-secondary
                        "
                    />
                </div>

                {/* Description */}

                <p
                    className="
                        mt-5
                        text-center
                        text-sm
                        leading-7
                        text-muted-foreground
                        sm:text-[15px]
                    "
                >
                    {card.description}
                </p>

                {/* Bottom */}

                <div className="mt-6 flex justify-center">
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-border/70
                            bg-background/60
                            px-3
                            py-1.5
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.12em]
                            text-muted-foreground
                        "
                    >
                        <span
                            className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-primary
                            "
                        />

                        SkillKwiz Advantage
                    </span>
                </div>
            </div>
        </motion.article>
    );
}

/* ================================================================
   MOBILE / TABLET NORMAL CARD
================================================================ */

function NormalCard({
    card,
    prefersReducedMotion,
}: {
    card: {
        id: string;
        title: string;
        description: string;
        image: string;
        alt: string;
    };
    prefersReducedMotion: boolean | null;
}) {
    return (
        <motion.article
            initial={
                prefersReducedMotion
                    ? undefined
                    : {
                          opacity: 0,
                          y: 20,
                      }
            }
            whileInView={
                prefersReducedMotion
                    ? undefined
                    : {
                          opacity: 1,
                          y: 0,
                      }
            }
            viewport={{
                once: true,
                amount: 0.2,
            }}
            transition={{
                duration: 0.55,
            }}
            whileHover={
                prefersReducedMotion
                    ? undefined
                    : {
                          y: -8,
                          scale: 1.015,
                      }
            }
            className="
                group
                relative
                w-full
                touch-manipulation
            "
        >
            <div
                className="
                    relative
                    flex
                    min-h-[390px]
                    w-full
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-border/70
                    bg-card/95
                    p-6
                    shadow-2xl
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    hover:border-primary/30
                    hover:shadow-[0_25px_80px_hsl(var(--primary)/.14)]
                    sm:min-h-[410px]
                    sm:p-7
                "
            >
                {/* Top highlight */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-x-8
                        top-0
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-primary
                        to-transparent
                        opacity-40
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                    "
                />

                {/* Image */}

                <motion.div
                    whileHover={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  scale: 1.08,
                                  rotate: 5,
                              }
                    }
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                    }}
                    className="
                        relative
                        mx-auto
                        flex
                        h-24
                        w-24
                        shrink-0
                        overflow-hidden
                        rounded-full
                        border
                        border-primary/20
                        bg-primary/5
                        shadow-[0_0_45px_hsl(var(--primary)/.1)]
                        sm:h-28
                        sm:w-28
                    "
                >
                    <Image
                        src={card.image}
                        alt={card.alt}
                        width={112}
                        height={112}
                        loading="lazy"
                        unoptimized
                        className="
                            h-full
                            w-full
                            object-cover
                        "
                    />
                </motion.div>

                {/* Title */}

                <div className="mt-7 text-center">
                    <h3
                        className="
                            text-xl
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-primary
                            sm:text-2xl
                        "
                    >
                        {card.title}
                    </h3>

                    <div
                        className="
                            mx-auto
                            mt-3
                            h-1
                            w-10
                            rounded-full
                            bg-primary
                            transition-all
                            duration-500
                            group-hover:w-20
                            group-hover:bg-secondary
                        "
                    />
                </div>

                {/* Description */}

                <p
                    className="
                        mt-5
                        flex-1
                        text-center
                        text-sm
                        leading-7
                        text-muted-foreground
                        sm:text-[15px]
                    "
                >
                    {card.description}
                </p>

                {/* Bottom */}

                <div className="mt-6 flex justify-center">
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-border/70
                            bg-background/60
                            px-3
                            py-1.5
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.12em]
                            text-muted-foreground
                        "
                    >
                        <span
                            className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-primary
                            "
                        />

                        SkillKwiz Advantage
                    </span>
                </div>
            </div>
        </motion.article>
    );
}