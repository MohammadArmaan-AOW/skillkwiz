"use client";

import EmployeeAssessments from "../_components/EmployeeAssessments";
import { EmployeeWorkflow } from "../_components/EmployeeWorkflow";

export default function EmployeeAssessmentsPage() {
    return (
        <EmployeeWorkflow
            title="Assessments"
            description="View and complete the assessments assigned to you."
            currentHref="/services/employee/assessments"
        >
            <EmployeeAssessments />
        </EmployeeWorkflow>
    );
}
