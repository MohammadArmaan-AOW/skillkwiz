"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Building2,
    CheckCircle2,
    Edit3,
    Globe2,
    LockKeyhole,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useEmployerProfile } from "@/hooks/queries/employer/useEmployerProfile";

import ProfileInput from "@/app/services/employer/profile/_components/ProfileInput";
import ProfileDetail from "@/app/services/employer/profile/_components/ProfileDetail";
import InfoRow from "@/app/services/employer/profile/_components/InfoRow";

import AssessmentAuthorization from "@/app/services/employer/profile/_components/AssessmentAuthorization";
import PaymentDetails from "@/app/services/employer/profile/_components/PaymentDetails";
import { useRazorpay } from "@/hooks/queries/employer/payments/useRazorpay";
import { usePaypal } from "@/hooks/queries/employer/payments/usePaypal";
import EmployerLogoutButton from "./EmployerLogoutButton";

export default function EmployerProfile() {
    const {
        profile,
        isLoading,
        isError,
        error,

        updateProfile,
        isUpdatingProfile,
        updateProfileError,
        updateProfileSuccess,
        resetUpdateProfile,

        updatePassword,
        isUpdatingPassword,
        updatePasswordError,
        updatePasswordSuccess,
        resetUpdatePassword,
    } = useEmployerProfile();

    const [isEditing, setIsEditing] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        profilePhoto: "",
        phoneNumber: "",
        companyName: "",
        companyAddress: "",
        department: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    /* ---------------------------------------------------------------------- */
    /* Sync profile data with form                                            */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!profile) {
            return;
        }

        setFormData({
            fullName: profile.fullName ?? "",
            profilePhoto: profile.profilePhoto ?? "",
            phoneNumber: profile.phoneNumber ?? "",
            companyName: profile.companyName ?? "",
            companyAddress: profile.companyAddress ?? "",
            department: profile.department ?? "",
        });
    }, [profile]);

    /* ---------------------------------------------------------------------- */
    /* Profile update success                                                 */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!updateProfileSuccess) {
            return;
        }

        const timer = setTimeout(() => {
            resetUpdateProfile();
        }, 2500);

        return () => clearTimeout(timer);
    }, [updateProfileSuccess, resetUpdateProfile]);

    /* ---------------------------------------------------------------------- */
    /* Password update success                                                */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!updatePasswordSuccess) {
            return;
        }

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        const timer = setTimeout(() => {
            resetUpdatePassword();
            setIsChangingPassword(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, [updatePasswordSuccess, resetUpdatePassword]);

    /* ---------------------------------------------------------------------- */
    /* Initials                                                               */
    /* ---------------------------------------------------------------------- */

    const initials = useMemo(() => {
        if (!profile?.fullName) {
            return "E";
        }

        return profile.fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => name.charAt(0).toUpperCase())
            .join("");
    }, [profile?.fullName]);

    /* ---------------------------------------------------------------------- */
    /* Profile handlers                                                       */
    /* ---------------------------------------------------------------------- */

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleEdit = () => {
        if (!profile) {
            return;
        }

        setFormData({
            fullName: profile.fullName ?? "",
            profilePhoto: profile.profilePhoto ?? "",
            phoneNumber: profile.phoneNumber ?? "",
            companyName: profile.companyName ?? "",
            companyAddress: profile.companyAddress ?? "",
            department: profile.department ?? "",
        });

        resetUpdateProfile();
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                fullName: profile.fullName ?? "",
                profilePhoto: profile.profilePhoto ?? "",
                phoneNumber: profile.phoneNumber ?? "",
                companyName: profile.companyName ?? "",
                companyAddress: profile.companyAddress ?? "",
                department: profile.department ?? "",
            });
        }

        resetUpdateProfile();
        setIsEditing(false);
    };

    const handleProfileSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            await updateProfile({
                fullName: formData.fullName.trim(),
                profilePhoto: formData.profilePhoto.trim() || null,
                phoneNumber: formData.phoneNumber.trim(),
                companyName: formData.companyName.trim(),
                companyAddress: formData.companyAddress.trim(),
                department: formData.department.trim(),
            });

            setIsEditing(false);
        } catch {
            // Mutation state displays the error.
        }
    };

    /* ---------------------------------------------------------------------- */
    /* Password handlers                                                      */
    /* ---------------------------------------------------------------------- */

    const handlePasswordChange = (
        field: keyof typeof passwordData,
        value: string,
    ) => {
        setPasswordData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handlePasswordSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            });
        } catch {
            // Mutation state displays the error.
        }
    };

    const handleCancelPassword = () => {
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        resetUpdatePassword();
        setIsChangingPassword(false);
    };

    /* ---------------------------------------------------------------------- */
    /* Loading                                                                */
    /* ---------------------------------------------------------------------- */

    if (isLoading) {
        return (
            <div className="space-y-5">
                <div className="h-36 animate-pulse rounded-xl border border-border bg-muted/40" />

                <div className="grid gap-3 sm:grid-cols-3">
                    {Array.from({
                        length: 3,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-28 animate-pulse rounded-xl border border-border bg-muted/40"
                        />
                    ))}
                </div>

                <div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />

                <div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Error                                                                  */
    /* ---------------------------------------------------------------------- */

    if (isError || !profile) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
                <h2 className="text-lg font-semibold">
                    Unable to load your profile
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    {error?.message ??
                        "We couldn't retrieve your employer profile. Please try again."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* Profile Header                                                    */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col gap-5 rounded-xl border border-border bg-muted/30 p-5 sm:flex-row sm:items-center">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
                    {profile.profilePhoto ? (
                        <img
                            src={profile.profilePhoto}
                            alt={`${profile.fullName} profile`}
                            className="size-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>

                <div className="flex-1">
                    <p className="text-sm font-medium text-primary">
                        Employer profile
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">
                        {profile.fullName}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {profile.companyName || "Organization not added"}

                        {profile.department ? ` · ${profile.department}` : ""}
                    </p>
                </div>

                {!isEditing ? (
                    <Button
                        variant="outline"
                        className="w-fit"
                        onClick={handleEdit}
                    >
                        <Edit3 className="size-4" />
                        Edit profile
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="w-fit"
                        onClick={handleCancel}
                        disabled={isUpdatingProfile}
                    >
                        <X className="size-4" />
                        Cancel
                    </Button>
                )}
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Edit Profile                                                      */}
            {/* ---------------------------------------------------------------- */}

            {isEditing && (
                <form
                    onSubmit={handleProfileSubmit}
                    className="rounded-xl border border-border bg-card p-5"
                >
                    <div>
                        <h3 className="text-lg font-semibold">Edit profile</h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Update your personal and organization information.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <ProfileInput
                            label="Full name"
                            value={formData.fullName}
                            onChange={(value) =>
                                handleChange("fullName", value)
                            }
                            required
                        />

                        <ProfileInput
                            label="Email"
                            value={profile.email}
                            disabled
                            icon={<LockKeyhole className="size-4" />}
                            helper="Email cannot be changed."
                        />

                        <ProfileInput
                            label="Phone number"
                            value={formData.phoneNumber}
                            onChange={(value) =>
                                handleChange("phoneNumber", value)
                            }
                        />

                        <ProfileInput
                            label="Department"
                            value={formData.department}
                            onChange={(value) =>
                                handleChange("department", value)
                            }
                        />

                        <ProfileInput
                            label="Company name"
                            value={formData.companyName}
                            onChange={(value) =>
                                handleChange("companyName", value)
                            }
                        />

                        <ProfileInput
                            label="Profile photo URL"
                            value={formData.profilePhoto}
                            onChange={(value) =>
                                handleChange("profilePhoto", value)
                            }
                            placeholder="https://..."
                        />

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium">
                                Company address
                            </label>

                            <textarea
                                value={formData.companyAddress}
                                onChange={(event) =>
                                    handleChange(
                                        "companyAddress",
                                        event.target.value,
                                    )
                                }
                                rows={3}
                                maxLength={500}
                                className="mt-2 flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                                placeholder="Enter your company address"
                            />
                        </div>
                    </div>

                    {updateProfileError && (
                        <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            {updateProfileError.message}
                        </div>
                    )}

                    {updateProfileSuccess && (
                        <div className="mt-5 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                            <CheckCircle2 className="size-4" />
                            Profile updated successfully.
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={isUpdatingProfile}>
                            <Save className="size-4" />

                            {isUpdatingProfile ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </form>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Profile Details                                                   */}
            {/* ---------------------------------------------------------------- */}

            {!isEditing && (
                <>
                    {/* -------------------------------------------------------- */}
                    {/* Basic Details                                               */}
                    {/* -------------------------------------------------------- */}

                    <div className="grid gap-3 sm:grid-cols-3">
                        <ProfileDetail
                            icon={Mail}
                            label="Email"
                            value={profile.email}
                        />

                        <ProfileDetail
                            icon={Phone}
                            label="Phone"
                            value={profile.phoneNumber || "Not added"}
                        />

                        <ProfileDetail
                            icon={Building2}
                            label="Department"
                            value={profile.department || "Not added"}
                        />
                    </div>

                    {/* -------------------------------------------------------- */}
                    {/* Organization                                               */}
                    {/* -------------------------------------------------------- */}

                    <section className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Building2 className="size-5" />
                            </div>

                            <div>
                                <h3 className="font-semibold">Organization</h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your organization details.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <InfoRow
                                icon={Building2}
                                label="Company Name"
                                value={profile.companyName || "Not added"}
                            />

                            <InfoRow
                                icon={MapPin}
                                label="Company Address"
                                value={profile.companyAddress || "Not added"}
                            />
                        </div>
                    </section>

                    {/* -------------------------------------------------------- */}
                    {/* Sign-in Methods                                             */}
                    {/* -------------------------------------------------------- */}

                    <section className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ShieldCheck className="size-5" />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Sign-in methods
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your available account sign-in methods.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="size-5 text-muted-foreground" />

                                    <div>
                                        <p className="text-sm font-medium">
                                            Email authentication
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {profile.email}
                                        </p>
                                    </div>
                                </div>

                                <span className="text-xs font-medium text-primary">
                                    {profile.emailVerified
                                        ? "Verified"
                                        : "Not verified"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                                <div className="flex items-center gap-3">
                                    <Globe2 className="size-5 text-muted-foreground" />

                                    <div>
                                        <p className="text-sm font-medium">
                                            Google
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {profile.googleId
                                                ? "Google account connected"
                                                : "Google account not connected"}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={
                                        profile.googleId
                                            ? "text-xs font-medium text-primary"
                                            : "text-xs font-medium text-muted-foreground"
                                    }
                                >
                                    {profile.googleId
                                        ? "Connected"
                                        : "Not connected"}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* -------------------------------------------------------- */}
                    {/* Assessment Authorization                                  */}
                    {/* -------------------------------------------------------- */}

                    <AssessmentAuthorization />

                    {/* -------------------------------------------------------- */}
                    {/* Payment Details Placeholder                               */}
                    {/* -------------------------------------------------------- */}

                    <PaymentDetails />

                    {/* -------------------------------------------------------- */}
                    {/* Password                                                  */}
                    {/* -------------------------------------------------------- */}

                    <section className="rounded-xl border border-border bg-card p-5">
                        {!isChangingPassword ? (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <LockKeyhole className="size-5" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">
                                            Password
                                        </h3>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Update your account password.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-fit"
                                    onClick={() => {
                                        resetUpdatePassword();
                                        setIsChangingPassword(true);
                                    }}
                                >
                                    <LockKeyhole className="size-4" />
                                    Change password
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <LockKeyhole className="size-5" />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">
                                                Change password
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Enter your current password and
                                                choose a new one.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-fit"
                                        onClick={handleCancelPassword}
                                        disabled={isUpdatingPassword}
                                    >
                                        <X className="size-4" />
                                        Cancel
                                    </Button>
                                </div>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    <ProfileInput
                                        label="Current password"
                                        value={passwordData.currentPassword}
                                        onChange={(value) =>
                                            handlePasswordChange(
                                                "currentPassword",
                                                value,
                                            )
                                        }
                                        required
                                    />

                                    <div />

                                    <ProfileInput
                                        label="New password"
                                        value={passwordData.newPassword}
                                        onChange={(value) =>
                                            handlePasswordChange(
                                                "newPassword",
                                                value,
                                            )
                                        }
                                        required
                                    />

                                    <ProfileInput
                                        label="Confirm new password"
                                        value={passwordData.confirmPassword}
                                        onChange={(value) =>
                                            handlePasswordChange(
                                                "confirmPassword",
                                                value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {updatePasswordError && (
                                    <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                        {updatePasswordError.message}
                                    </div>
                                )}

                                {updatePasswordSuccess && (
                                    <div className="mt-5 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                                        <CheckCircle2 className="size-4" />
                                        Password updated successfully.
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                    >
                                        <Save className="size-4" />

                                        {isUpdatingPassword
                                            ? "Updating..."
                                            : "Update password"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </section>

                    {/* -------------------------------------------------------- */}
                    {/* Account                                                   */}
                    {/* -------------------------------------------------------- */}

                    <section className="rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium">Account</p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Sign out of your employer account on this
                                    device.
                                </p>
                            </div>

                            <EmployerLogoutButton
                                variant="small"
                                color="destructive"
                            />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
