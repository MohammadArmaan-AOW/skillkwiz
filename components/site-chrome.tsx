"use client";

import { usePathname } from "next/navigation";

import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default function SiteChrome({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isAssessmentSandbox =
        /^\/services\/employee\/assessment\/[^/]+(?:\/submitted)?\/?$/.test(
            pathname,
        );

    if (isAssessmentSandbox) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen">
            <SiteHeader />

            <main>{children}</main>

            <SiteFooter />
        </div>
    );
}