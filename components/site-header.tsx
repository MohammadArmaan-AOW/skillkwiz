"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/data/nav-links";
import ThemeToggler from "./theme-toggler";

export default function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const pathname = usePathname();

    /* ---------------------------------------------
       Scroll detection
    --------------------------------------------- */

    useEffect(() => {
        const updateScrolledState = () => {
            setIsScrolled(window.scrollY > 20);
        };

        updateScrolledState();

        window.addEventListener("scroll", updateScrolledState, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", updateScrolledState);
        };
    }, []);

    /* ---------------------------------------------
       Close mobile menu on route change
    --------------------------------------------- */

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    /* ---------------------------------------------
       Escape key
    --------------------------------------------- */

    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => {
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    /* ---------------------------------------------
       Navbar animation
       - Larger at top
       - Slightly compressed after scrolling
    --------------------------------------------- */

    const navVariants = {
        initial: {
            y: -80,
            opacity: 0,
            scale: 1,
            borderRadius: 18,
        },
        top: {
            y: 0,
            opacity: 1,
            scale: 1,
            borderRadius: 18,
        },
        scrolled: {
            y: 0,
            opacity: 1,
            scale: 1,
            borderRadius: 14,
        },
    };

    /* ---------------------------------------------
       Logo animation
    --------------------------------------------- */

    const logoVariants = {
        top: {
            width: 175,
            height: 72,
        },
        scrolled: {
            width: 160,
            height: 60,
        },
    };

    return (
        <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-4 sm:px-5">
            <motion.nav
                aria-label="Main navigation"
                variants={navVariants}
                initial="initial"
                animate={isScrolled ? "scrolled" : "top"}
                transition={{
                    y: {
                        type: "spring",
                        stiffness: 140,
                        damping: 16,
                        mass: 1,
                    },
                    opacity: {
                        duration: 0.4,
                        ease: "easeOut",
                    },
                    scale: {
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                    },
                    borderRadius: {
                        duration: 0.35,
                    },
                }}
                className={cn(
                    "pointer-events-auto relative mx-auto flex max-w-6xl items-center justify-between",
                    "border border-border/60",
                    "bg-background/90 backdrop-blur-xl",
                    "transition-shadow duration-300",
                    isScrolled ? "shadow-md shadow-black/5" : "shadow-sm",
                )}
            >
                {/* ---------------------------------------------
                    Logo
                --------------------------------------------- */}

                <Link
                    href="/"
                    aria-label="SkillKwiz home"
                    className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <motion.div
                        animate={isScrolled ? "scrolled" : "top"}
                        variants={logoVariants}
                        transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative"
                    >
                        {/* Light theme logo */}
                        <Image
                            src="/images/logo.png"
                            alt="SkillKwiz"
                            fill
                            priority
                            sizes="175px"
                            className="object-contain dark:hidden"
                        />

                        {/* Dark theme logo */}
                        <Image
                            src="/images/logo-dark.png"
                            alt="SkillKwiz"
                            fill
                            priority
                            sizes="175px"
                            className="hidden object-contain dark:block"
                        />
                    </motion.div>
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggler />

                    {/* ---------------------------------------------
                        Desktop Navigation
                    --------------------------------------------- */}

                    <div className="hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map(({ href, label }) => {
                            const isActive =
                                href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={cn(
                                        "group relative rounded-md px-3 py-2 text-sm font-medium",
                                        "transition-colors duration-200",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        "lg:px-4",
                                        isActive
                                            ? "bg-gradient-to-r from-purple-600 via-blue-500 to-red-500 bg-clip-text text-transparent"
                                            : "text-muted-foreground hover:bg-gradient-to-r hover:from-purple-600 hover:via-blue-500 hover:to-red-500 hover:bg-clip-text hover:text-transparent",
                                    )}
                                >
                                    {label}

                                    {/* Purple active / hover underline */}
                                    <motion.span
                                        className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 via-blue-500 to-red-500"
                                        initial={false}
                                        animate={{
                                            width: isActive
                                                ? "calc(100% - 1.5rem)"
                                                : 0,
                                        }}
                                        whileHover={{
                                            width: "calc(100% - 1.5rem)",
                                        }}
                                        transition={{
                                            duration: 0.25,
                                            ease: "easeOut",
                                        }}
                                    />
                                </Link>
                            );
                        })}
                    </div>

                    {/* ---------------------------------------------
                        Mobile Menu Button
                    --------------------------------------------- */}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-navigation"
                        aria-label={
                            isMenuOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{
                                        rotate: -90,
                                        opacity: 0,
                                        scale: 0.7,
                                    }}
                                    animate={{
                                        rotate: 0,
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{
                                        rotate: 90,
                                        opacity: 0,
                                        scale: 0.7,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                    }}
                                >
                                    <X aria-hidden="true" className="h-5 w-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{
                                        rotate: 90,
                                        opacity: 0,
                                        scale: 0.7,
                                    }}
                                    animate={{
                                        rotate: 0,
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{
                                        rotate: -90,
                                        opacity: 0,
                                        scale: 0.7,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                    }}
                                >
                                    <Menu
                                        aria-hidden="true"
                                        className="h-5 w-5"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>

                {/* ---------------------------------------------
                    Mobile Navigation
                --------------------------------------------- */}

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            id="mobile-navigation"
                            initial={{
                                opacity: 0,
                                y: -10,
                                scale: 0.98,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: -8,
                                scale: 0.98,
                            }}
                            transition={{
                                duration: 0.25,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute left-0 right-0 top-full mt-3 md:hidden"
                        >
                            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-2 shadow-lg backdrop-blur-xl">
                                {NAV_LINKS.map(({ href, label }, index) => {
                                    const isActive =
                                        href === "/"
                                            ? pathname === "/"
                                            : pathname.startsWith(href);

                                    return (
                                        <motion.div
                                            key={href}
                                            initial={{
                                                opacity: 0,
                                                x: -12,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                            }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.25,
                                            }}
                                        >
                                            <Link
                                                href={href}
                                                aria-current={
                                                    isActive
                                                        ? "page"
                                                        : undefined
                                                }
                                                className={cn(
                                                    "block rounded-lg px-4 py-3 text-sm font-medium",
                                                    "transition-colors",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                                                )}
                                            >
                                                {label}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </header>
    );
}
