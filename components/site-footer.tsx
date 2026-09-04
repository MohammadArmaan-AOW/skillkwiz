"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowUpRight,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

import {
    COMPANY_LINKS,
    LEGAL_LINKS,
    QUICK_LINKS,
} from "@/lib/data/footer";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    /*
     * Main footer reveal.
     * The animation starts when the footer enters the viewport.
     */
    const footerContainer: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.15,
            },
        },
    };

    /*
     * Individual footer column animation.
     */
    const footerItem: Variants = {
        hidden: {
            opacity: 0,
            y: 35,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    /*
     * Top gradient line animation.
     */
    const gradientLine: Variants = {
        hidden: {
            scaleX: 0,
            opacity: 0,
        },
        visible: {
            scaleX: 1,
            opacity: 1,
            transition: {
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    /*
     * Bottom bar animation.
     */
    const bottomBar: Variants = {
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
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    return (
        <motion.footer
            initial="hidden"
            whileInView="visible"
            viewport={{
                once: true,
                amount: 0.15,
            }}
            variants={footerContainer}
            className="bg-primary text-primary-foreground"
        >
            {/* =========================================================
                BRAND GRADIENT LINE
            ========================================================== */}

            <motion.div
                aria-hidden="true"
                variants={gradientLine}
                style={{ transformOrigin: "left" }}
                className="h-1 w-full bg-primary-gradient"
            />

            {/* =========================================================
                MAIN FOOTER
            ========================================================== */}

            <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
                <div
                    className="
                        grid gap-10
                        sm:grid-cols-2
                        lg:grid-cols-[1.5fr_1fr_1fr_1.25fr]
                        lg:gap-12
                    "
                >
                    {/* =================================================
                        BRAND / ABOUT
                    ================================================= */}

                    <motion.div
                        variants={footerItem}
                        className="sm:col-span-2 lg:col-span-1"
                    >
                        {/* Logo */}
                        <Link
                            href="/"
                            aria-label="SkillKwiz home"
                            className="
                                inline-flex items-center
                                rounded-md
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ring
                                focus-visible:ring-offset-2
                                focus-visible:ring-offset-primary
                            "
                        >
                            <div className="relative h-[58px] w-[175px] sm:h-[64px] sm:w-[195px]">
                                {/* Light theme */}
                                <Image
                                    src="/images/logo.png"
                                    alt="SkillKwiz"
                                    fill
                                    priority
                                    sizes="195px"
                                    className="object-contain dark:hidden"
                                />

                                {/* Dark theme */}
                                <Image
                                    src="/images/logo-dark.png"
                                    alt="SkillKwiz"
                                    fill
                                    priority
                                    sizes="195px"
                                    className="hidden object-contain dark:block"
                                />
                            </div>
                        </Link>

                        {/* Description */}
                        <p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/70">
                            SkillKwiz is transforming recruitment with
                            innovative skill assessment solutions and
                            practical support for modern hiring teams.
                        </p>

                        {/* Company Links */}
                        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                            {COMPANY_LINKS.map((link) => (
                                <FooterLink
                                    key={link.href}
                                    href={link.href}
                                >
                                    {link.label}
                                </FooterLink>
                            ))}
                        </div>
                    </motion.div>

                    {/* =================================================
                        QUICK LINKS
                    ================================================= */}

                    <motion.div variants={footerItem}>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                            Quick Links
                        </h3>

                        <ul className="mt-5 space-y-3">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.href}>
                                    <FooterLink href={link.href}>
                                        {link.label}
                                    </FooterLink>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* =================================================
                        CONTACT
                    ================================================= */}

                    <motion.div variants={footerItem}>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                            Contact
                        </h3>

                        <div className="mt-5 space-y-4 text-sm">
                            {/* Address */}
                            <ContactItem icon={MapPin}>
                                <span>
                                    5th Block,
                                    <br />
                                    Jayanagar, Bangalore 560041
                                </span>
                            </ContactItem>

                            {/* Email */}
                            <ContactItem icon={Mail}>
                                <a
                                    href="mailto:info@skillkwiz.com"
                                    className="
                                        break-all
                                        text-primary-foreground/70
                                        transition-colors
                                        hover:text-primary-foreground
                                        hover:underline
                                    "
                                >
                                    info@skillkwiz.com
                                </a>
                            </ContactItem>

                            {/* Phone */}
                            <ContactItem icon={Phone}>
                                <a
                                    href="tel:+919740377330"
                                    className="
                                        text-primary-foreground/70
                                        transition-colors
                                        hover:text-primary-foreground
                                        hover:underline
                                    "
                                >
                                    +91-9740377330
                                </a>
                            </ContactItem>
                        </div>
                    </motion.div>

                    {/* =================================================
                        CTA
                    ================================================= */}

                    <motion.div variants={footerItem}>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                            Get Started
                        </h3>

                        <p className="mt-5 text-sm leading-6 text-primary-foreground/70">
                            Ready to simplify your hiring and skill assessment
                            process?
                        </p>

                        <Link
                            href="/services"
                            className="
                                group mt-5 inline-flex items-center gap-2
                                rounded-full
                                bg-secondary
                                px-5 py-2.5
                                text-sm font-semibold
                                text-secondary-foreground
                                transition-all duration-200
                                hover:bg-secondary/90
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ring
                                focus-visible:ring-offset-2
                                focus-visible:ring-offset-primary
                            "
                        >
                            Explore Services

                            <ArrowUpRight
                                aria-hidden="true"
                                className="
                                    h-4 w-4
                                    transition-transform
                                    duration-200
                                    group-hover:-translate-y-0.5
                                    group-hover:translate-x-0.5
                                "
                            />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* =========================================================
                BOTTOM BAR
            ========================================================== */}

            <motion.div
                variants={bottomBar}
                className="border-t border-primary-foreground/10"
            >
                <div
                    className="
                        mx-auto flex max-w-7xl
                        flex-col gap-4
                        px-5 py-5
                        text-xs
                        text-primary-foreground/55
                        sm:px-8
                        md:flex-row
                        md:items-center
                        md:justify-between
                        lg:px-10
                    "
                >
                    <p>
                        © {currentYear} SkillKwiz. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        {LEGAL_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="
                                    transition-colors
                                    hover:text-primary-foreground
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-ring
                                    focus-visible:ring-offset-2
                                    focus-visible:ring-offset-primary
                                "
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.footer>
    );
}

/* =========================================================
   FOOTER LINK
========================================================= */

type FooterLinkProps = {
    href: string;
    children: React.ReactNode;
};

function FooterLink({
    href,
    children,
}: FooterLinkProps) {
    return (
        <Link
            href={href}
            className="
                group inline-flex items-center
                text-sm
                text-primary-foreground/70
                transition-colors duration-200
                hover:text-primary-foreground
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
                focus-visible:ring-offset-2
                focus-visible:ring-offset-primary
            "
        >
            {children}

            <ArrowUpRight
                aria-hidden="true"
                className="
                    ml-1 h-3.5 w-3.5
                    opacity-0
                    -translate-y-0.5
                    transition-all duration-200
                    group-hover:translate-x-0.5
                    group-hover:opacity-100
                "
            />
        </Link>
    );
}

/* =========================================================
   CONTACT ITEM
========================================================= */

type ContactItemProps = {
    icon: React.ComponentType<{
        className?: string;
        strokeWidth?: number;
    }>;
    children: React.ReactNode;
};

function ContactItem({
    icon: Icon,
    children,
}: ContactItemProps) {
    return (
        <div className="flex items-start gap-3">
            <Icon
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                strokeWidth={1.8}
            />

            <div className="leading-6">
                {children}
            </div>
        </div>
    );
}