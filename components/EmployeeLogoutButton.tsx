"use client";

import { ReactNode, useState } from "react";

import { LogOut, Loader2 } from "lucide-react";

import axios from "axios";

import { useRouter } from "next/navigation";

type EmployeeLogoutButtonProps = {
    variant?: "giant" | "large" | "medium" | "small" | "icon";

    color?: "primary" | "destructive" | "neutral";

    showIcon?: boolean;

    children?: ReactNode;

    className?: string;

    redirectTo?: string;

    disabled?: boolean;
};

const variantClasses = {
    giant: "h-14 w-full px-6 text-base",

    large: "h-12 px-5 text-sm",

    medium: "h-10 px-4 text-sm",

    small: "h-8 px-3 text-xs",

    icon: "size-9 p-0",
};

const colorClasses = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",

    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",

    neutral:
        "border border-border bg-background text-foreground hover:bg-muted",
};

export default function EmployeeLogoutButton({
    variant = "medium",

    color = "destructive",

    showIcon = true,

    children = "Logout",

    className = "",

    redirectTo = "/login?role=employee",

    disabled = false,
}: EmployeeLogoutButtonProps) {
    const router = useRouter();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut || disabled) {
            return;
        }

        try {
            setIsLoggingOut(true);

            await axios.post(
                "/api/auth/employee/logout",
                {},
                {
                    withCredentials: true,
                },
            );

            router.replace(redirectTo);
            router.refresh();
        } catch (error) {
            console.error("Employee logout error:", error);

            setIsLoggingOut(false);
        }
    };

    const isIconOnly = variant === "icon";

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut || disabled}
            aria-label={isIconOnly ? "Logout" : undefined}
            className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                font-medium
                transition-all
                duration-200
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${variantClasses[variant]}
                ${colorClasses[color]}
                ${className}
            `}
        >
            {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
            ) : (
                showIcon && <LogOut className="size-4" />
            )}

            {!isIconOnly && (
                <span>{isLoggingOut ? "Logging out..." : children}</span>
            )}
        </button>
    );
}
