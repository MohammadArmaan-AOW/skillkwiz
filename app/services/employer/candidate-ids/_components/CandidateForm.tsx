"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCreateEmployee } from "@/hooks/queries/useEmployeeAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CandidateFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CandidateForm({
    isOpen,
    onClose,
}: CandidateFormProps) {
    const createEmployee = useCreateEmployee();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [department, setDepartment] = useState("");
    const [designation, setDesignation] = useState("");

    const resetForm = () => {
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setDepartment("");
        setDesignation("");
        createEmployee.reset();
    };

    const handleClose = () => {
        if (createEmployee.isPending) return;

        resetForm();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, createEmployee.isPending]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await createEmployee.mutateAsync({
                fullName: fullName.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim() || undefined,
                department: department.trim() || undefined,
                designation: designation.trim() || undefined,
            });

            resetForm();
            onClose();

            toast.success("Employee ID Created Successfully")

        } catch {
            // Mutation error is displayed below.
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-candidate-title"
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
                    <div>
                        <h2
                            id="create-candidate-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Create Candidate
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Create a candidate account and send their login
                            credentials.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleClose}
                        disabled={createEmployee.isPending}
                        variant={"ghost"}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <InputField
                            label="Full Name"
                            required
                            name="name"
                            value={fullName}
                            onChange={setFullName}
                            placeholder="Enter candidate name"
                        />

                        <InputField
                            label="Email"
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={setEmail}
                            placeholder="candidate@example.com"
                        />

                        <InputField
                            label="Phone Number"
                            value={phoneNumber}
                            name="phone"
                            onChange={setPhoneNumber}
                            placeholder="Enter phone number"
                        />

                        <InputField
                            label="Department"
                            value={department}
                            onChange={setDepartment}
                            placeholder="e.g. Engineering"
                        />

                        <InputField
                            label="Designation"
                            value={designation}
                            onChange={setDesignation}
                            placeholder="e.g. Software Engineer"
                        />
                    </div>

                    {/* Info */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm leading-6 text-gray-600">
                            A candidate account will be created automatically.
                            Their employee ID and temporary password will be
                            sent to their email address.
                        </p>
                    </div>

                    {/* Error */}
                    {createEmployee.isError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {createEmployee.error?.message ||
                                "Failed to create candidate. Please try again."}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant={"outline"}
                            onClick={handleClose}
                            disabled={createEmployee.isPending}
                            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                createEmployee.isPending ||
                                !fullName.trim() ||
                                !email.trim()
                            }
                        >
                            {createEmployee.isPending
                                ? "Creating..."
                                : "Create Candidate"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface InputFieldProps {
    label: string;
    value: string;
    name?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}

function InputField({
    label,
    value,
    onChange,
    placeholder,
    name,
    type = "text",
    required = false,
}: InputFieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            <input
                type={type}
                value={value}
                name={name}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500/20"
            />
        </div>
    );
}