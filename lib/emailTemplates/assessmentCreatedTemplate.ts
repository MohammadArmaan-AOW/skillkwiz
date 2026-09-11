interface AssessmentCreatedTemplateProps {
    employeeName: string;
    assessmentTitle: string;
    assessmentDescription?: string;
    startAt?: Date | string;
    endAt?: Date | string;
    durationMinutes?: number;
}

function formatDateTime(value: Date | string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
    }).format(new Date(value));
}

export function assessmentCreatedTemplate({
    employeeName,
    assessmentTitle,
    assessmentDescription,
    startAt,
    endAt,
    durationMinutes,
}: AssessmentCreatedTemplateProps) {
    const hasTiming = startAt && endAt;

    const timingSection = hasTiming
        ? `
            <div style="
                margin: 24px 0;
                padding: 20px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
            ">
                <h3 style="
                    margin: 0 0 14px;
                    color: #0f172a;
                    font-size: 16px;
                ">
                    Assessment Schedule
                </h3>

                <p style="
                    margin: 8px 0;
                    color: #475569;
                    font-size: 14px;
                ">
                    <strong>Starts:</strong>
                    ${formatDateTime(startAt)}
                </p>

                <p style="
                    margin: 8px 0;
                    color: #475569;
                    font-size: 14px;
                ">
                    <strong>Ends:</strong>
                    ${formatDateTime(endAt)}
                </p>

                ${
                    durationMinutes
                        ? `
                            <p style="
                                margin: 8px 0;
                                color: #475569;
                                font-size: 14px;
                            ">
                                <strong>Duration:</strong>
                                ${durationMinutes} minutes
                            </p>
                        `
                        : ""
                }
            </div>
        `
        : "";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Assessment Assigned</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f1f5f9;
    font-family: Arial, Helvetica, sans-serif;
">

    <div style="
        width: 100%;
        padding: 40px 16px;
        box-sizing: border-box;
    ">

        <div style="
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        ">

            <!-- Header -->
            <div style="
                padding: 28px 32px;
                background: #0f172a;
                color: #ffffff;
            ">
                <h1 style="
                    margin: 0;
                    font-size: 24px;
                    line-height: 1.3;
                ">
                    SkillKwiz
                </h1>

                <p style="
                    margin: 8px 0 0;
                    color: #cbd5e1;
                    font-size: 14px;
                ">
                    Online Assessment Platform
                </p>
            </div>

            <!-- Content -->
            <div style="
                padding: 32px;
            ">

                <p style="
                    margin: 0 0 16px;
                    color: #0f172a;
                    font-size: 16px;
                ">
                    Hello ${employeeName},
                </p>

                <h2 style="
                    margin: 0 0 14px;
                    color: #0f172a;
                    font-size: 22px;
                ">
                    You have been assigned an assessment
                </h2>

                <p style="
                    margin: 0 0 20px;
                    color: #475569;
                    font-size: 15px;
                    line-height: 1.7;
                ">
                    You have been assigned the following assessment on
                    SkillKwiz.
                </p>

                <div style="
                    padding: 18px;
                    border-left: 4px solid #0f172a;
                    background: #f8fafc;
                    border-radius: 8px;
                ">
                    <h3 style="
                        margin: 0 0 8px;
                        color: #0f172a;
                        font-size: 18px;
                    ">
                        ${assessmentTitle}
                    </h3>

                    ${
                        assessmentDescription
                            ? `
                                <p style="
                                    margin: 0;
                                    color: #64748b;
                                    font-size: 14px;
                                    line-height: 1.6;
                                ">
                                    ${assessmentDescription}
                                </p>
                            `
                            : ""
                    }
                </div>

                ${timingSection}

                <p style="
                    margin: 24px 0 0;
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.7;
                ">
                    Please log in to your SkillKwiz account to access the
                    assessment when it becomes available.
                </p>

                <p style="
                    margin: 20px 0 0;
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.6;
                ">
                    Please make sure you complete the assessment within the
                    specified assessment window.
                </p>

            </div>

            <!-- Footer -->
            <div style="
                padding: 20px 32px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
            ">
                <p style="
                    margin: 0;
                    color: #94a3b8;
                    font-size: 12px;
                    text-align: center;
                ">
                    This is an automated email from SkillKwiz.
                    Please do not reply to this email.
                </p>
            </div>

        </div>

    </div>

</body>
</html>
`;
}
