
interface EmployeeVerificationOtpTemplateProps {
    fullName: string;
    otp: string;
}

export function employeeVerificationOtpTemplate({
    fullName,
    otp,
}: EmployeeVerificationOtpTemplateProps) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>SkillKwiz Verification Code</title>
        </head>

        <body
            style="
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
                font-family: Arial, Helvetica, sans-serif;
            "
        >
            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="padding: 40px 16px;"
            >
                <tr>
                    <td align="center">

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            style="
                                max-width: 560px;
                                background: #ffffff;
                                border: 1px solid #e5e7eb;
                                border-radius: 12px;
                                overflow: hidden;
                            "
                        >
                            <tr>
                                <td
                                    style="
                                        padding: 28px 32px;
                                        border-bottom: 1px solid #e5e7eb;
                                    "
                                >
                                    <h1
                                        style="
                                            margin: 0;
                                            font-size: 24px;
                                            color: #111827;
                                        "
                                    >
                                        SkillKwiz
                                    </h1>

                                    <p
                                        style="
                                            margin: 6px 0 0;
                                            font-size: 13px;
                                            color: #6b7280;
                                        "
                                    >
                                        Candidate Assessment Platform
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 32px;">

                                    <p
                                        style="
                                            margin: 0 0 12px;
                                            font-size: 16px;
                                            color: #111827;
                                        "
                                    >
                                        Hi ${fullName},
                                    </p>

                                    <p
                                        style="
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 1.6;
                                            color: #4b5563;
                                        "
                                    >
                                        Use the verification code below
                                        to verify your email address and
                                        continue signing in to your
                                        SkillKwiz account.
                                    </p>

                                    <div
                                        style="
                                            margin: 28px 0;
                                            padding: 20px;
                                            text-align: center;
                                            border: 1px solid #e5e7eb;
                                            border-radius: 10px;
                                            background: #fafafa;
                                        "
                                    >
                                        <div
                                            style="
                                                font-size: 12px;
                                                color: #6b7280;
                                                margin-bottom: 8px;
                                            "
                                        >
                                            Verification Code
                                        </div>

                                        <div
                                            style="
                                                font-size: 32px;
                                                font-weight: 700;
                                                letter-spacing: 8px;
                                                color: #111827;
                                            "
                                        >
                                            ${otp}
                                        </div>
                                    </div>

                                    <p
                                        style="
                                            margin: 0;
                                            font-size: 13px;
                                            line-height: 1.6;
                                            color: #6b7280;
                                        "
                                    >
                                        This verification code will expire
                                        in <strong>10 minutes</strong>.
                                    </p>

                                    <p
                                        style="
                                            margin: 18px 0 0;
                                            font-size: 13px;
                                            line-height: 1.6;
                                            color: #6b7280;
                                        "
                                    >
                                        If you did not attempt to sign in
                                        to SkillKwiz, you can safely ignore
                                        this email.
                                    </p>

                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 20px 32px;
                                        border-top: 1px solid #e5e7eb;
                                    "
                                >
                                    <p
                                        style="
                                            margin: 0;
                                            font-size: 12px;
                                            color: #9ca3af;
                                        "
                                    >
                                        This is an automated message from
                                        SkillKwiz. Please do not reply to
                                        this email.
                                    </p>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}
