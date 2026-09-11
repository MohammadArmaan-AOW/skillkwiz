interface AssessmentDeletedTemplateProps {
    employeeName: string;
    assessmentTitle: string;
    startAt?: Date | string;
    endAt?: Date | string;
}

function formatDateTime(value: Date | string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
    }).format(new Date(value));
}

export function assessmentDeletedTemplate({
    employeeName,
    assessmentTitle,
    startAt,
    endAt,
}: AssessmentDeletedTemplateProps) {
    const hasTiming = startAt && endAt;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Assessment Cancelled</title>
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
                    Assessment Cancelled
                </h2>

                <p style="
                    margin: 0 0 20px;
                    color: #475569;
                    font-size: 15px;
                    line-height: 1.7;
                ">
                    The following assessment assigned to you has been
                    cancelled and is no longer available.
                </p>

                <div style="
                    padding: 18px;
                    border-left: 4px solid #64748b;
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
                        hasTiming
                            ? `
                                <p style="
                                    margin: 8px 0 0;
                                    color: #64748b;
                                    font-size: 14px;
                                ">
                                    <strong>Scheduled:</strong><br />
                                    ${formatDateTime(startAt)} -
                                    ${formatDateTime(endAt)}
                                </p>
                            `
                            : ""
                    }
                </div>

                <p style="
                    margin: 24px 0 0;
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.7;
                ">
                    You do not need to take any action regarding this
                    assessment.
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
