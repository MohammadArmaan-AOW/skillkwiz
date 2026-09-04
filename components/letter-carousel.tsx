"use client";

import Image from "next/image";
import Link from "next/link";

import { ChevronLeft, ChevronRight, PlayCircle, Sparkles } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { SLIDE_COPY, slides } from "@/lib/data/carousel";

const SLIDE_DURATION = 6000;

export default function LetterCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const reduceMotion = useReducedMotion();

    const sectionRef = useRef<HTMLElement>(null);

    const currentSlideRef = useRef(0);

    const activeSlide = slides[currentSlide];

    currentSlideRef.current = currentSlide;

    /*
     * ---------------------------------------------------------
     * Slide navigation
     * ---------------------------------------------------------
     */

    const showSlide = useCallback((index: number) => {
        setCurrentSlide((index + slides.length) % slides.length);
    }, []);

    /*
     * ---------------------------------------------------------
     * Autoplay
     * ---------------------------------------------------------
     */

    useEffect(() => {
        if (isPaused || reduceMotion) return;

        const interval = window.setInterval(() => {
            setCurrentSlide((slide) => (slide + 1) % slides.length);
        }, SLIDE_DURATION);

        return () => {
            window.clearInterval(interval);
        };
    }, [isPaused, reduceMotion]);

    /*
     * ---------------------------------------------------------
     * Keyboard navigation
     * ---------------------------------------------------------
     */

    useEffect(() => {
        const node = sectionRef.current;

        if (!node) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();

                showSlide(currentSlideRef.current - 1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();

                showSlide(currentSlideRef.current + 1);
            }
        };

        node.addEventListener("keydown", onKeyDown);

        return () => {
            node.removeEventListener("keydown", onKeyDown);
        };
    }, [showSlide]);

    return (
        <section
            ref={sectionRef}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="SkillKwiz highlights"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={(event) => {
                if (
                    !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                    )
                ) {
                    setIsPaused(true);
                }
            }}
            onBlur={(event) => {
                if (
                    !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                    )
                ) {
                    setIsPaused(false);
                }
            }}
            className="
                relative
                h-[100svh]
                min-h-[680px]
                w-full
                overflow-hidden
                bg-background
                outline-none
            "
        >
            {/* =====================================================
                FULL PAGE IMAGE
            ====================================================== */}

            <AnimatePresence initial={false} mode="sync">
                <motion.div
                    key={activeSlide.title}
                    initial={
                        reduceMotion
                            ? { opacity: 1 }
                            : {
                                  opacity: 0,
                                  scale: 1.035,
                              }
                    }
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{
                        duration: reduceMotion ? 0 : 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0"
                >
                    <Image
                        src={activeSlide.backgroundImage}
                        alt=""
                        fill
                        priority={currentSlide === 0}
                        sizes="100vw"
                        className="
                            object-cover
                            object-center
                        "
                    />
                </motion.div>
            </AnimatePresence>

            {/* =====================================================
                TINT
            ====================================================== */}

            <div
                className="
                    absolute
                    inset-0
                    bg-primary/[.18]
                    dark:bg-primary/[.34]
                "
            />

            {/* =====================================================
                SERVICES PAGE STYLE AMBIENT GLOWS
            ====================================================== */}

            <div
                className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_78%_12%,hsl(var(--primary)/.2),transparent_32%),radial-gradient(circle_at_12%_84%,hsl(var(--secondary)/.1),transparent_25%)]
                    dark:bg-[radial-gradient(circle_at_78%_12%,hsl(var(--primary)/.4),transparent_32%),radial-gradient(circle_at_12%_84%,hsl(var(--secondary)/.22),transparent_25%)]
                "
            />

            {/* =====================================================
                BOTTOM FADE
            ====================================================== */}

            <div
                className="
                    absolute
                    inset-x-0
                    bottom-0
                    h-2/5
                    bg-gradient-to-t
                    from-primary-gradient
                    to-transparent
                    dark:from-background/85
                "
            />

            {/* =====================================================
                DOT GRID
            ====================================================== */}

            <div
                className="
                    absolute
                    inset-0
                    bg-[radial-gradient(hsl(var(--secondary)/.35)_1.5px,transparent_1.5px)]
                    bg-[size:28px_28px]
                    [mask-image:linear-gradient(90deg,black,transparent_72%)]
                    dark:bg-[radial-gradient(hsl(var(--secondary)/.5)_1.5px,transparent_1.5px)]
                "
            />

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <div
                className="
                    relative
                    z-10
                    mx-auto
                    flex
                    h-full
                    max-w-6xl
                    items-center
                    px-5
                    pt-16
                    sm:px-8
                    lg:px-10
                "
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSlide.title}
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      y: 20,
                                  }
                        }
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={
                            reduceMotion
                                ? undefined
                                : {
                                      opacity: 0,
                                      y: -14,
                                  }
                        }
                        transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="max-w-xl"
                    >
                        {/* =================================================
                            EYEBROW
                        ================================================== */}

                        <motion.div
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          y: 10,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.08,
                            }}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-secondary/20
                                bg-secondary/10
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[.15em]
                                text-secondary/90
                                backdrop-blur-md
                            "
                        >
                            <Sparkles
                                className="
                                    size-3.5
                                    text-secondary
                                "
                            />
                            SkillKwiz platform
                        </motion.div>

                        {/* =================================================
                            TITLE
                        ================================================== */}

                        <h1
                            className="
                                mt-5
                                text-balance
                                text-5xl
                                font-semibold
                                leading-[.98]
                                tracking-[-.05em]
                                text-primary-foreground
                                sm:text-6xl
                                lg:text-7xl
                            "
                        >
                            {activeSlide.title}
                        </h1>

                        {/* =================================================
                            DESCRIPTION
                        ================================================== */}

                        <p
                            className="
                                mt-5
                                max-w-lg
                                text-pretty
                                text-base
                                leading-7
                                text-primary-foreground/75
                                sm:text-lg
                            "
                        >
                            {SLIDE_COPY[activeSlide.title]}
                        </p>

                        {/* =================================================
                            CTA BUTTONS
                        ================================================== */}

                        <div
                            className="
                                mt-7
                                flex
                                flex-wrap
                                gap-3
                            "
                        >
                            <Button
                                asChild
                                size="lg"
                                className="
                                    rounded-full
                                    bg-primary
                                    px-5
                                    shadow-xl
                                    shadow-black/20
                                    hover:bg-primary-foreground
                                    hover:text-black
                                "
                            >
                                <Link href="/services">
                                    Explore solutions
                                    <ChevronRight className="size-4" />
                                </Link>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="
                                    rounded-full
                                    border-secondary/25
                                    bg-secondary/10
                                    px-5
                                    text-secondary
                                    backdrop-blur
                                    hover:bg-secondary/20
                                    hover:text-secondary
                                "
                            >
                                <Link href="/about">
                                    <PlayCircle className="size-4" />
                                    Our story
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* =====================================================
                PREVIOUS — OUTSIDE CONTENT
                VERTICAL CENTER OF SCREEN
            ====================================================== */}

            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => showSlide(currentSlide - 1)}
                aria-label="Previous slide"
                className="
                    absolute
                    left-4
                    top-1/2
                    z-30
                    size-10
                    -translate-y-1/2
                    rounded-full
                    border-primary/20
                    bg-primary/10
                    text-primary
                    backdrop-blur
                    hover:bg-primary-foreground
                    hover:text-primary
                    sm:left-6
                    lg:left-8
                "
            >
                <ChevronLeft className="size-4" />
            </Button>

            {/* =====================================================
                NEXT — OUTSIDE CONTENT
                VERTICAL CENTER OF SCREEN
            ====================================================== */}

            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => showSlide(currentSlide + 1)}
                aria-label="Next slide"
                className="
                    absolute
                    right-4
                    top-1/2
                    z-30
                    size-10
                    -translate-y-1/2
                    rounded-full
                    border-primary/20
                    bg-primary/10
                    text-primary
                    backdrop-blur
                    hover:bg-primary-foreground
                    hover:text-primary
                    sm:right-6
                    lg:right-8
                "
            >
                <ChevronRight className="size-4" />
            </Button>

            {/* =====================================================
                BOTTOM SLIDE INDICATORS
            ====================================================== */}

            <div
                className="
                    absolute
                    inset-x-5
                    bottom-6
                    z-20
                    mx-auto
                    flex
                    max-w-6xl
                    items-center
                    justify-center
                    sm:inset-x-8
                    lg:inset-x-10
                "
            >
                <div
                    className="
                        flex
                        w-full
                        max-w-xs
                        items-center
                        gap-2
                    "
                >
                    {slides.map((slide, index) => (
                        <button
                            key={slide.title}
                            type="button"
                            role="tab"
                            aria-selected={index === currentSlide}
                            aria-label={`Show ${slide.title}`}
                            onClick={() => showSlide(index)}
                            className="
                                    group
                                    relative
                                    h-1.5
                                    flex-1
                                    overflow-hidden
                                    rounded-full
                                    bg-primary-foreground/25
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-primary-foreground
                                "
                        >
                            <motion.span
                                key={`${slide.title}-${currentSlide}`}
                                className="
                                        absolute
                                        inset-y-0
                                        left-0
                                        rounded-full
                                        bg-primary-foreground
                                    "
                                initial={{
                                    width: index < currentSlide ? "100%" : "0%",
                                }}
                                animate={{
                                    width:
                                        index === currentSlide &&
                                        !isPaused &&
                                        !reduceMotion
                                            ? "100%"
                                            : index < currentSlide
                                              ? "100%"
                                              : "0%",
                                }}
                                transition={{
                                    duration:
                                        index === currentSlide &&
                                        !isPaused &&
                                        !reduceMotion
                                            ? SLIDE_DURATION / 1000
                                            : 0.2,
                                    ease: "linear",
                                }}
                            />
                        </button>
                    ))}

                    <span
                        className="
                            ml-1
                            border-l
                            border-primary-foreground/25
                            pl-3
                            text-xs
                            font-medium
                            tabular-nums
                            text-primary-foreground/75
                        "
                    >
                        {String(currentSlide + 1).padStart(2, "0")}
                    </span>
                </div>
            </div>
        </section>
    );
}
