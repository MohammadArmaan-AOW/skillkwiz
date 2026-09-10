"use client";

import { useState } from "react";
import {
    CheckCircle2,
    Clock3,
    KeyRound,
    Mail,
    Phone,
    ShieldCheck,
    UserRound,
    BriefcaseBusiness,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
    useChangeEmployeePassword,
    useEmployeeMe,
} from "@/hooks/queries/useEmployeeAuth";
import { Button } from "@/components/ui/button";
import EmployeeLogoutButton from "@/components/EmployeeLogoutButton";

function formatDate(date?: string | null) {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof UserRound;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {value || "Not provided"}
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: "success" | "warning" | "default";
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                variant === "success"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : variant === "warning"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-muted text-muted-foreground"
            }`}
        >
            {children}
        </span>
    );
}

export default function EmployeeProfile() {
    const { data, isLoading, isError, error } = useEmployeeMe();

    const changePassword = useChangeEmployeePassword();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const employee = data?.employee;

    const handleChangePassword = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!employee) {
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please complete all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            toast.error(
                "Your new password must be different from your current password.",
            );
            return;
        }

        try {
            await changePassword.mutateAsync({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success("Password changed successfully.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to change your password.",
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading your profile...
                </div>
            </div>
        );
    }

    if (isError || !employee) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5">
                <p className="text-sm font-semibold text-destructive">
                    Unable to load your profile
                </p>

                <p className="mt-1 text-sm text-destructive/80">
                    {error instanceof Error
                        ? error.message
                        : "Please try again later."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* -------------------------------------------------------------- */}
            {/* Profile Header                                                  */}
            {/* -------------------------------------------------------------- */}

            <section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl primary-gradient text-white">
                            <UserRound className="size-6" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold tracking-tight">
                                {employee.fullName}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Employee ID:{" "}
                                <span className="font-medium text-foreground">
                                    {employee.employeeId}
                                </span>
                            </p>
                        </div>
                    </div>

                    <StatusBadge
                        variant={employee.isActive ? "success" : "warning"}
                    >
                        {employee.isActive ? (
                            <>
                                <CheckCircle2 className="size-3.5" />
                                Active
                            </>
                        ) : (
                            <>
                                <Clock3 className="size-3.5" />
                                Inactive
                            </>
                        )}
                    </StatusBadge>
                </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* Basic Information                                               */}
            {/* -------------------------------------------------------------- */}

            <section>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Basic information</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Your employee account and work information.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <InfoItem
                        icon={Mail}
                        label="Email"
                        value={employee.email}
                    />

                    <InfoItem
                        icon={Phone}
                        label="Phone number"
                        value={employee.phoneNumber || "Not provided"}
                    />

                    <InfoItem
                        icon={BriefcaseBusiness}
                        label="Department"
                        value={employee.department || "Not provided"}
                    />

                    <InfoItem
                        icon={UserRound}
                        label="Designation"
                        value={employee.designation || "Not provided"}
                    />
                </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* Account Status                                                  */}
            {/* -------------------------------------------------------------- */}

            <section>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Account overview</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Current status and security information for your
                        account.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-border bg-background p-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            <span className="text-sm font-medium">
                                Email verification
                            </span>
                        </div>

                        <div className="mt-3">
                            {employee.emailVerified ? (
                                <StatusBadge variant="success">
                                    <CheckCircle2 className="size-3.5" />
                                    Verified
                                </StatusBadge>
                            ) : (
                                <StatusBadge variant="warning">
                                    <Clock3 className="size-3.5" />
                                    Not verified
                                </StatusBadge>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                        <div className="flex items-center gap-2">
                            <UserRound className="size-4 text-primary" />
                            <span className="text-sm font-medium">
                                Sign-in status
                            </span>
                        </div>

                        <div className="mt-3">
                            {employee.hasSignedIn ? (
                                <StatusBadge variant="success">
                                    <CheckCircle2 className="size-3.5" />
                                    Signed in
                                </StatusBadge>
                            ) : (
                                <StatusBadge>
                                    <Clock3 className="size-3.5" />
                                    First sign-in pending
                                </StatusBadge>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                        <div className="flex items-center gap-2">
                            <KeyRound className="size-4 text-primary" />
                            <span className="text-sm font-medium">
                                Password
                            </span>
                        </div>

                        <div className="mt-3">
                            {employee.mustChangePassword ? (
                                <StatusBadge variant="warning">
                                    <Clock3 className="size-3.5" />
                                    Change required
                                </StatusBadge>
                            ) : (
                                <StatusBadge variant="success">
                                    <CheckCircle2 className="size-3.5" />
                                    Up to date
                                </StatusBadge>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* Activity                                                        */}
            {/* -------------------------------------------------------------- */}

            <section>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Account activity</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Important dates related to your employee account.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <InfoItem
                        icon={Clock3}
                        label="First signed in"
                        value={formatDate(employee.firstSignedInAt)}
                    />

                    <InfoItem
                        icon={Clock3}
                        label="Last signed in"
                        value={formatDate(employee.lastSignedInAt)}
                    />
                </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* Change Password                                                 */}
            {/* -------------------------------------------------------------- */}

            <section className="border-t border-border pt-8">
                <div className="mb-5">
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <KeyRound className="size-4" />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">
                                Change password
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Keep your account secure by using a strong
                                password.
                            </p>
                        </div>
                    </div>
                </div>

                {employee.mustChangePassword && (
                    <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                        <p className="text-sm font-medium text-amber-700">
                            Your temporary password must be changed before you
                            continue using your account.
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleChangePassword}
                    className="w-full space-y-4"
                >
                    <PasswordInput
                        label="Current password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        autoComplete="current-password"
                    />

                    <PasswordInput
                        label="New password"
                        value={newPassword}
                        onChange={setNewPassword}
                        autoComplete="new-password"
                    />

                    <PasswordInput
                        label="Confirm new password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        autoComplete="new-password"
                    />

                    <div className="rounded-lg bg-muted/60 px-3 py-2.5">
                        <p className="text-xs leading-5 text-muted-foreground">
                            Your new password should contain at least 8
                            characters.
                        </p>
                    </div>

                    <Button type="submit" disabled={changePassword.isPending}>
                        {changePassword.isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Changing password...
                            </>
                        ) : (
                            <>
                                <KeyRound className="size-4" />
                                Change password
                            </>
                        )}
                    </Button>
                </form>

                {/* ---------------------------------------------------------- */}
                {/* Logout                                                      */}
                {/* ---------------------------------------------------------- */}

                <div className="flex items-center justify-between mt-8 border-t border-border pt-6">
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold">
                            Account session
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Sign out of your employee account on this device.
                        </p>
                    </div>

                    <EmployeeLogoutButton
                        variant="large"
                        color="destructive"
                        className="w-full sm:w-auto"
                    />
                </div>
            </section>
        </div>
    );
}

function PasswordInput({
    label,
    value,
    onChange,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>

            <input
                required
                type="password"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoComplete={autoComplete}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
        </label>
    );
}
