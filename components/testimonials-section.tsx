"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Testimonial, testimonials } from "@/lib/data/testimonial";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TestimonialsSection() {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /**
     * ----------------------------------------
     * Animation variants
     * ----------------------------------------
     */

    const headingVariants = {
        hidden: {
            opacity: 0,
            y: 30,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeOut",
            },
        },
    };

    const descriptionVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                delay: 0.15,
                ease: "easeOut",
            },
        },
    };

    const carouselVariants = {
        hidden: {
            opacity: 0,
            y: 35,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                delay: 0.15,
                ease: "easeOut",
            },
        },
    };

    const dotsVariants = {
        hidden: {
            opacity: 0,
            y: 15,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.3,
            },
        },
    };

    /**
     * Start / restart automatic rotation.
     */
    const startAutoRotate = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setActiveIndex(
                (prev: number) => (prev + 1) % testimonials.length,
            );
        }, 5000);
    }, []);

    /**
     * Start automatic rotation on mount.
     */
    useEffect(() => {
        startAutoRotate();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [startAutoRotate]);

    /**
     * Navigate to a specific testimonial.
     */
    const goToSlide = (index: number) => {
        setActiveIndex(index);
        startAutoRotate();
    };

    /**
     * Navigate to previous testimonial.
     */
    const goToPrev = () => {
        setActiveIndex(
            (prev: number) =>
                (prev - 1 + testimonials.length) % testimonials.length,
        );

        startAutoRotate();
    };

    /**
     * Navigate to next testimonial.
     */
    const goToNext = () => {
        setActiveIndex(
            (prev: number) => (prev + 1) % testimonials.length,
        );

        startAutoRotate();
    };

    /**
     * Get testimonial relative to the active slide.
     */
    const getTestimonial = (offset: number): Testimonial => {
        const index =
            (activeIndex + offset + testimonials.length) %
            testimonials.length;

        return testimonials[index];
    };

    const previousTestimonial = getTestimonial(-1);
    const currentTestimonial = getTestimonial(0);
    const nextTestimonial = getTestimonial(1);

    return (
        <section className="bg-background py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

                {/* ----------------------------------------
                    Section heading
                ----------------------------------------- */}

                <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
                    <motion.p
                        variants={headingVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.3,
                        }}
                        className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary-gradient"
                    >
                        Client feedback
                    </motion.p>

                    <motion.h2
                        variants={headingVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.3,
                        }}
                        className="text-balance text-3xl font-bold tracking-tight text-primary-gradient sm:text-4xl lg:text-5xl"
                    >
                        What Our Clients Say
                    </motion.h2>

                    <motion.p
                        variants={descriptionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.3,
                        }}
                        className="mt-4 text-pretty leading-7 text-muted-foreground"
                    >
                        Hear from organizations that use SkillKwiz to evaluate
                        skills and make better hiring decisions.
                    </motion.p>
                </div>

                <div className="relative">

                    {/* ----------------------------------------
                        Desktop navigation
                    ----------------------------------------- */}

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={goToPrev}
                            className={cn(
                                "absolute left-0 top-1/2 z-30 hidden -translate-y-1/2",
                                "rounded-full border-border bg-background",
                                "text-primary shadow-sm",
                                "transition-all duration-300",
                                "hover:border-primary hover:bg-primary hover:text-primary-foreground",
                                "md:flex",
                                "lg:-left-5",
                            )}
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft aria-hidden="true" />
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={goToNext}
                            className={cn(
                                "absolute right-0 top-1/2 z-30 hidden -translate-y-1/2",
                                "rounded-full border-border bg-background",
                                "text-primary shadow-sm",
                                "transition-all duration-300",
                                "hover:border-primary hover:bg-primary hover:text-primary-foreground",
                                "md:flex",
                                "lg:-right-5",
                            )}
                            aria-label="Next testimonial"
                        >
                            <ChevronRight aria-hidden="true" />
                        </Button>
                    </motion.div>

                    {/* ----------------------------------------
                        Desktop carousel
                    ----------------------------------------- */}

                    <motion.div
                        variants={carouselVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        className="hidden min-h-[360px] items-center justify-center gap-4 overflow-hidden px-8 md:flex lg:px-12"
                    >
                        {/* Previous */}
                        <TestimonialCard
                            key={`previous-${previousTestimonial.id}`}
                            testimonial={previousTestimonial}
                            variant="side"
                        />

                        {/* Active */}
                        <AnimatePresence mode="wait">
                            <TestimonialCard
                                key={`active-${currentTestimonial.id}`}
                                testimonial={currentTestimonial}
                                variant="active"
                            />
                        </AnimatePresence>

                        {/* Next */}
                        <TestimonialCard
                            key={`next-${nextTestimonial.id}`}
                            testimonial={nextTestimonial}
                            variant="side"
                        />
                    </motion.div>

                    {/* ----------------------------------------
                        Mobile carousel
                    ----------------------------------------- */}

                    <motion.div
                        variants={carouselVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        className="md:hidden"
                    >
                        <AnimatePresence mode="wait">
                            <TestimonialCard
                                key={`mobile-${currentTestimonial.id}`}
                                testimonial={currentTestimonial}
                                variant="mobile"
                            />
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="mt-6 flex items-center justify-center gap-3"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={goToPrev}
                                className="h-10 w-10 rounded-full text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft aria-hidden="true" />
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={goToNext}
                                className="h-10 w-10 rounded-full text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight aria-hidden="true" />
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* ----------------------------------------
                        Pagination
                    ----------------------------------------- */}

                    <motion.div
                        variants={dotsVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.3,
                        }}
                        className="mt-8 flex items-center justify-center gap-2"
                        role="tablist"
                        aria-label="Choose a testimonial"
                    >
                        {testimonials.map(
                            (
                                testimonial: Testimonial,
                                index: number,
                            ) => {
                                const isActive =
                                    index === activeIndex;

                                return (
                                    <button
                                        key={testimonial.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        aria-label={`Go to testimonial ${
                                            index + 1
                                        }`}
                                        onClick={() =>
                                            goToSlide(index)
                                        }
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            "focus-visible:outline-none",
                                            "focus-visible:ring-2 focus-visible:ring-ring",
                                            isActive
                                                ? "w-8 bg-primary-gradient"
                                                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                                        )}
                                    />
                                );
                            },
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   Testimonial Card
========================================================= */

type TestimonialCardProps = {
    testimonial: Testimonial;
    variant: "side" | "active" | "mobile";
};

function TestimonialCard({
    testimonial,
    variant,
}: TestimonialCardProps) {
    const isActive = variant === "active";
    const isMobile = variant === "mobile";

    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 25,
                scale: 0.96,
            }}
            animate={{
                opacity: isActive || isMobile ? 1 : 0.7,
                y: 0,
                scale: isActive || isMobile ? 1 : 0.94,
            }}
            exit={{
                opacity: 0,
                y: -20,
                scale: 0.96,
            }}
            transition={{
                duration: 0.5,
                ease: "easeOut",
            }}
            className={cn(
                "flex flex-col rounded-2xl border border-border bg-card text-card-foreground",
                "transition-colors duration-500",

                /* Desktop side cards */
                variant === "side" && [
                    "w-[25%] max-w-sm",
                    "min-h-[250px]",
                ],

                /* Desktop active card */
                isActive && [
                    "z-20 w-[50%] max-w-2xl",
                    "min-h-[350px]",
                    "border-primary/20",
                    "bg-primary",
                    "text-primary-foreground",
                ],

                /* Mobile card */
                isMobile && [
                    "w-full",
                    "min-h-[330px]",
                    "bg-primary",
                    "text-primary-foreground",
                ],
            )}
        >
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.07,
                            delayChildren: 0.08,
                        },
                    },
                }}
                className={cn(
                    "flex flex-col items-center",
                    isActive || isMobile
                        ? "p-6 sm:p-8"
                        : "p-4",
                )}
            >
                {/* Profile image */}

                <motion.div
                    variants={{
                        hidden: {
                            opacity: 0,
                            scale: 0.7,
                            y: 10,
                        },
                        visible: {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: {
                                duration: 0.45,
                                ease: "easeOut",
                            },
                        },
                    }}
                    className={cn(
                        "mb-4 overflow-hidden rounded-full border-2",
                        isActive || isMobile
                            ? "h-20 w-20 border-primary-foreground"
                            : "h-12 w-12 border-border",
                    )}
                >
                    <Image
                        src={
                            testimonial.image ||
                            "/placeholder.svg"
                        }
                        alt={testimonial.name}
                        width={
                            isActive || isMobile ? 80 : 48
                        }
                        height={
                            isActive || isMobile ? 80 : 48
                        }
                        className="h-full w-full object-cover"
                    />
                </motion.div>

                {/* Name */}

                <motion.h3
                    variants={{
                        hidden: {
                            opacity: 0,
                            y: 10,
                        },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.35,
                            },
                        },
                    }}
                    className={cn(
                        "text-center font-bold",
                        isActive || isMobile
                            ? "text-lg"
                            : "text-sm",
                    )}
                >
                    {testimonial.name}
                </motion.h3>

                {/* Position */}

                <motion.p
                    variants={{
                        hidden: {
                            opacity: 0,
                            y: 8,
                        },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.35,
                            },
                        },
                    }}
                    className={cn(
                        "mt-1 text-center",
                        isActive || isMobile
                            ? "text-sm text-primary-foreground/75"
                            : "text-xs text-muted-foreground",
                    )}
                >
                    {testimonial.title}
                </motion.p>

                {/* Stars */}

                <motion.div
                    variants={{
                        hidden: {
                            opacity: 0,
                            y: 8,
                        },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.35,
                            },
                        },
                    }}
                    className="mt-3 flex gap-0.5"
                >
                    {Array.from({ length: 5 }).map(
                        (_: unknown, index: number) => (
                            <motion.div
                                key={index}
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                transition={{
                                    duration: 0.25,
                                    delay: 0.2 + index * 0.05,
                                }}
                            >
                                <Star
                                    aria-hidden="true"
                                    className={cn(
                                        "fill-accent text-accent",
                                        isActive || isMobile
                                            ? "h-4 w-4"
                                            : "h-3 w-3",
                                    )}
                                />
                            </motion.div>
                        ),
                    )}
                </motion.div>
            </motion.div>

            {/* Quote */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.45,
                    delay: 0.15,
                    ease: "easeOut",
                }}
                className={cn(
                    "flex flex-1 items-start justify-center text-center",
                    isActive || isMobile
                        ? "px-6 pb-7 sm:px-8"
                        : "px-4 pb-5",
                )}
            >
                <p
                    className={cn(
                        "leading-6",
                        isActive || isMobile
                            ? "text-sm text-primary-foreground/90 sm:text-base"
                            : "line-clamp-4 text-xs text-muted-foreground",
                    )}
                >
                    "{testimonial.quote}"
                </p>
            </motion.div>
        </motion.article>
    );
}