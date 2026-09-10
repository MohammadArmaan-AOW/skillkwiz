export function employeeLoginOtpTemplate(
    employeeName: string,
    otp: string,
): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>SkillKwiz Email Verification</title>
            </head>

            <body
                style="
                    margin: 0;
                    padding: 0;
                    background-color: #f5f7fb;
                    font-family: Arial, Helvetica, sans-serif;
                "
            >
                <div
                    style="
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        border: 1px solid #e5e7eb;
                    "
                >
                    <div
                        style="
                            padding: 28px 32px;
                            text-align: center;
                            background: #ffffff;
                            border-bottom: 1px solid #e5e7eb;
                        "
                    >
                        <h1
                            style="
                                margin: 0;
                                font-size: 26px;
                                color: #111827;
                            "
                        >
                            SkillKwiz
                        </h1>

                        <p
                            style="
                                margin: 8px 0 0;
                                font-size: 14px;
                                color: #6b7280;
                            "
                        >
                            Employee Verification
                        </p>
                    </div>

                    <div style="padding: 32px;">
                        <p
                            style="
                                margin: 0 0 16px;
                                font-size: 16px;
                                color: #111827;
                            "
                        >
                            Hello ${employeeName},
                        </p>

                        <p
                            style="
                                margin: 0 0 24px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #4b5563;
                            "
                        >
                            We received a sign-in attempt for your
                            SkillKwiz employee account. Please use the
                            verification code below to verify your email
                            address and continue signing in.
                        </p>

                        <div
                            style="
                                margin: 28px 0;
                                padding: 22px;
                                text-align: center;
                                background-color: #f9fafb;
                                border: 1px solid #e5e7eb;
                                border-radius: 10px;
                            "
                        >
                            <p
                                style="
                                    margin: 0 0 8px;
                                    font-size: 13px;
                                    color: #6b7280;
                                "
                            >
                                Your verification code
                            </p>

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
                                margin: 0 0 12px;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #6b7280;
                            "
                        >
                            This OTP is valid for 10 minutes.
                        </p>

                        <p
                            style="
                                margin: 0 0 24px;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #6b7280;
                            "
                        >
                            If you did not attempt to sign in to SkillKwiz,
                            you can safely ignore this email.
                        </p>

                        <p
                            style="
                                margin: 0;
                                font-size: 14px;
                                color: #374151;
                            "
                        >
                            Regards,<br />
                            <strong>SkillKwiz Team</strong>
                        </p>
                    </div>

                    <div
                        style="
                            padding: 20px 32px;
                            background-color: #f9fafb;
                            text-align: center;
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
                            This is an automated email from SkillKwiz.
                            Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    `;
}
