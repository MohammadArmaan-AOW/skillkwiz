interface CandidateShortlistedTemplateParams {
    employeeName: string;
    assessmentTitle: string;
    skills: string[];
}

export function candidateShortlistedTemplate({
    employeeName,
    assessmentTitle,
    skills,
}: CandidateShortlistedTemplateParams): string {
    const skillsHtml =
        skills.length > 0
            ? `
                <div style="margin: 24px 0;">
                    <p style="
                        margin: 0 0 10px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #374151;
                    ">
                        Skills evaluated
                    </p>

                    <div>
                        ${skills
                            .map(
                                (skill) => `
                                    <span style="
                                        display: inline-block;
                                        margin: 0 6px 6px 0;
                                        padding: 6px 10px;
                                        border-radius: 999px;
                                        background: #f3f4f6;
                                        color: #374151;
                                        font-size: 12px;
                                    ">
                                        ${skill}
                                    </span>
                                `,
                            )
                            .join("")}
                    </div>
                </div>
            `
            : "";

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>You've Been Shortlisted</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
                font-family: Arial, Helvetica, sans-serif;
                color: #111827;
            ">
                <div style="
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 0 20px;
                ">
                    <div style="
                        background-color: #ffffff;
                        border-radius: 12px;
                        padding: 40px;
                        border: 1px solid #e5e7eb;
                    ">
                        <div style="
                            margin-bottom: 28px;
                            text-align: center;
                        ">
                            <h1 style="
                                margin: 0;
                                font-size: 28px;
                                line-height: 1.3;
                                color: #111827;
                            ">
                                Congratulations!
                            </h1>
                        </div>

                        <p style="
                            margin: 0 0 18px;
                            font-size: 16px;
                            line-height: 1.7;
                            color: #374151;
                        ">
                            Hi ${employeeName},
                        </p>

                        <p style="
                            margin: 0 0 18px;
                            font-size: 16px;
                            line-height: 1.7;
                            color: #374151;
                        ">
                            We are pleased to let you know that you have
                            been <strong>shortlisted</strong> for the
                            <strong>${assessmentTitle}</strong> assessment.
                        </p>

                        ${skillsHtml}

                        <p style="
                            margin: 0 0 18px;
                            font-size: 16px;
                            line-height: 1.7;
                            color: #374151;
                        ">
                            Your assessment performance has been reviewed
                            by the employer, and you have been selected
                            to move forward in the recruitment process.
                        </p>

                        <p style="
                            margin: 0 0 24px;
                            font-size: 16px;
                            line-height: 1.7;
                            color: #374151;
                        ">
                            The employer will contact you with the next
                            steps if any further action is required.
                        </p>

                        <div style="
                            margin-top: 32px;
                            padding-top: 24px;
                            border-top: 1px solid #e5e7eb;
                        ">
                            <p style="
                                margin: 0;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #6b7280;
                            ">
                                Best wishes,<br />
                                <strong>SkillKwiz Team</strong>
                            </p>
                        </div>
                    </div>

                    <p style="
                        margin: 20px 0 0;
                        text-align: center;
                        font-size: 12px;
                        color: #9ca3af;
                    ">
                        This is an automated email from SkillKwiz.
                    </p>
                </div>
            </body>
        </html>
    `;
}