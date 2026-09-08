import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-provider";
import QueryProvider from "@/contexts/query-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("https://skillkwiz.com"),

    title: {
        default: "SkillKwiz - Skill Assessment Solutions",
        template: "%s | SkillKwiz",
    },

    description:
        "SkillKwiz provides skill assessment solutions that help businesses evaluate candidates and support employee development.",

    keywords: [
        "skill assessment",
        "employee assessment",
        "candidate assessment",
        "pre-employment assessment",
        "recruitment assessment",
        "employee development",
        "SkillKwiz",
    ],

    authors: [{ name: "SkillKwiz" }],
    creator: "SkillKwiz",
    publisher: "SkillKwiz",

    applicationName: "SkillKwiz",

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    alternates: {
        canonical: "https://skillkwiz.com",
    },

    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://skillkwiz.com",
        siteName: "SkillKwiz",
        title: "SkillKwiz - Skill Assessment Solutions",
        description:
            "SkillKwiz provides skill assessment solutions for recruitment, candidate evaluation, and employee development.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "SkillKwiz - Skill Assessment Solutions",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "SkillKwiz - Skill Assessment Solutions",
        description:
            "Skill assessment solutions for recruitment, candidate evaluation, and employee development.",
        images: ["/og-image.png"],
    },

    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },

    category: "technology",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <QueryProvider>
                        <div className="flex min-h-screen flex-col">
                            <Toaster
                                richColors
                                closeButton
                                position="top-center"
                            />
                            <SiteHeader />

                            <main className="flex-grow">{children}</main>

                            <SiteFooter />
                        </div>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
