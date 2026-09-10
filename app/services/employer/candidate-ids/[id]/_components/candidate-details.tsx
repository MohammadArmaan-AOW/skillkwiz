"use client";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Mail,
    Phone,
    ShieldCheck,
    User,
    UserRoundCheck,
    UserRoundX,
    BriefcaseBusiness,
    Building2,
    KeyRound,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
    useEmployeeDetails,
    useUpdateEmployeeStatus,
} from "@/hooks/queries/useEmployeeAuth";
import { Button } from "@/components/ui/button";

interface CandidateDetailsProps {
    employeeId: string;
}

export default function CandidateDetails({
    employeeId,
}: CandidateDetailsProps) {
    const router = useRouter();

    const { data, isLoading, isError, error, refetch, isFetching } =
        useEmployeeDetails(employeeId);

    const updateStatus = useUpdateEmployeeStatus();

    const employee = data?.employee;

    const handleStatusChange = async () => {
        if (!employee || updateStatus.isPending) return;

        const nextIsActive = !employee.isActive;

        try {
            await updateStatus.mutateAsync({
                employeeId: employee.employeeId,
                isActive: nextIsActive,
            });
        } catch (error) {
            console.error("Failed to update candidate status:", error);
        }
    };

    if (isLoading) {
        return <CandidateDetailsSkeleton />;
    }

    if (isError || !employee) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                    <div>
                        <h3 className="font-semibold text-red-900">
                            Unable to load candidate
                        </h3>

                        <p className="mt-1 text-sm text-red-700">
                            {error?.message ||
                                "Candidate details could not be found."}
                        </p>

                        <Button
                            type="button"
                            variant={"destructive"}
                            onClick={() => refetch()}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/services/employer/candidate-ids")
                        }
                        className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                        aria-label="Back to candidates"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {employee.fullName}
                            </h2>

                            <StatusBadge isActive={employee.isActive} />
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Candidate ID:{" "}
                            <span className="font-medium text-gray-700">
                                {employee.employeeId}
                            </span>
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleStatusChange}
                    disabled={updateStatus.isPending}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        employee.isActive
                            ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "bg-primary text-white hover:opacity-90"
                    }`}
                >
                    {updateStatus.isPending ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : employee.isActive ? (
                        <>
                            <UserRoundX className="h-4 w-4" />
                            Deactivate Candidate
                        </>
                    ) : (
                        <>
                            <UserRoundCheck className="h-4 w-4" />
                            Activate Candidate
                        </>
                    )}
                </button>
            </div>

            {updateStatus.isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {updateStatus.error?.message ||
                        "Failed to update candidate status."}
                </div>
            )}

            {/* Account Overview */}
            <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Account Overview
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Current status and authentication information.
                    </p>
                </div>

                <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    <InfoItem
                        icon={<User className="h-5 w-5" />}
                        label="Candidate ID"
                        value={employee.employeeId}
                    />

                    <InfoItem
                        icon={<Mail className="h-5 w-5" />}
                        label="Email Verification"
                        value={
                            employee.emailVerified ? "Verified" : "Not verified"
                        }
                        valueClassName={
                            employee.emailVerified
                                ? "text-green-600"
                                : "text-amber-600"
                        }
                    />

                    <InfoItem
                        icon={
                            employee.hasSignedIn ? (
                                <UserRoundCheck className="h-5 w-5" />
                            ) : (
                                <Clock3 className="h-5 w-5" />
                            )
                        }
                        label="Sign-in Status"
                        value={
                            employee.hasSignedIn
                                ? "Has signed in"
                                : "Never signed in"
                        }
                        valueClassName={
                            employee.hasSignedIn
                                ? "text-green-600"
                                : "text-gray-600"
                        }
                    />

                    <InfoItem
                        icon={<KeyRound className="h-5 w-5" />}
                        label="Password Status"
                        value={
                            employee.mustChangePassword
                                ? "Password change required"
                                : "Password updated"
                        }
                        valueClassName={
                            employee.mustChangePassword
                                ? "text-amber-600"
                                : "text-green-600"
                        }
                    />
                </div>
            </section>

            {/* Personal Information */}
            <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Personal Information
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Candidate contact information.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    <DetailItem
                        icon={<User className="h-5 w-5" />}
                        label="Full Name"
                        value={employee.fullName}
                    />

                    <DetailItem
                        icon={<Mail className="h-5 w-5" />}
                        label="Email Address"
                        value={employee.email}
                    />

                    <DetailItem
                        icon={<Phone className="h-5 w-5" />}
                        label="Phone Number"
                        value={employee.phoneNumber || "Not provided"}
                    />
                </div>
            </section>

            {/* Professional Information */}
            <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Professional Information
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Candidate's department and designation.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    <DetailItem
                        icon={<Building2 className="h-5 w-5" />}
                        label="Department"
                        value={employee.department || "Not provided"}
                    />

                    <DetailItem
                        icon={<BriefcaseBusiness className="h-5 w-5" />}
                        label="Designation"
                        value={employee.designation || "Not provided"}
                    />
                </div>
            </section>

            {/* Activity */}
            <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Account Activity
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Candidate account creation and sign-in activity.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
                    <DetailItem
                        icon={<CalendarDays className="h-5 w-5" />}
                        label="Account Created"
                        value={formatDate(employee.createdAt)}
                    />

                    <DetailItem
                        icon={<UserRoundCheck className="h-5 w-5" />}
                        label="First Sign-in"
                        value={formatDate(employee.firstSignedInAt)}
                    />

                    <DetailItem
                        icon={<Clock3 className="h-5 w-5" />}
                        label="Last Sign-in"
                        value={formatDate(employee.lastSignedInAt)}
                    />
                </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Security & Verification
                    </h3>
                </div>

                <div className="space-y-4 p-6">
                    <SecurityRow
                        label="Email verification"
                        enabled={employee.emailVerified}
                    />

                    <SecurityRow
                        label="Candidate has signed in"
                        enabled={employee.hasSignedIn}
                    />

                    <SecurityRow
                        label="Temporary password replaced"
                        enabled={!employee.mustChangePassword}
                    />

                    <SecurityRow
                        label="Account is active"
                        enabled={employee.isActive}
                    />
                </div>
            </section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-green-500" : "bg-gray-400"
                }`}
            />

            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

function InfoItem({
    icon,
    label,
    value,
    valueClassName = "text-gray-900",
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-start gap-4 px-6 py-5">
            <div className="rounded-xl bg-gray-50 p-2.5 text-gray-500">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                <p
                    className={`mt-1 break-words text-sm font-semibold ${valueClassName}`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-medium text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SecurityRow({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gray-400" />

                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
            </div>

            {enabled ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Yes
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                    <XCircle className="h-4 w-4" />
                    No
                </span>
            )}
        </div>
    );
}

function formatDate(date?: string | null) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}

function CandidateDetailsSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-6 w-48 rounded bg-gray-200" />
                    <div className="h-4 w-32 rounded bg-gray-200" />
                </div>

                <div className="h-10 w-40 rounded-xl bg-gray-200" />
            </div>

            {[1, 2, 3, 4].map((section) => (
                <div
                    key={section}
                    className="rounded-2xl border border-gray-200 bg-white"
                >
                    <div className="border-b border-gray-100 p-6">
                        <div className="h-5 w-40 rounded bg-gray-200" />
                        <div className="mt-2 h-4 w-64 rounded bg-gray-200" />
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        <div className="h-12 rounded bg-gray-100" />
                        <div className="h-12 rounded bg-gray-100" />
                        <div className="h-12 rounded bg-gray-100" />
                        <div className="h-12 rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}
