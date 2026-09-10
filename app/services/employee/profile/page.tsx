"use client";

import EmployeeProfile from "../_components/EmployeeProfile";
import { EmployeeWorkflow } from "../_components/EmployeeWorkflow";


export default function EmployeeProfilePage() {
    return (
        <EmployeeWorkflow
            title="Your profile"
            description="View your employee information, account status, and manage your account security."
            currentHref="/services/employee/profile"
        >
            <EmployeeProfile />
        </EmployeeWorkflow>
    );
}
