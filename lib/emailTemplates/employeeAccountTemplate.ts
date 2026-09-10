export function employeeAccountTemplate(
    fullName: string,
    employeeId: string,
    temporaryPassword: string,
): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Your SkillKwiz Employee Account</title>
        </head>

        <body
            style="
                margin: 0;
                padding: 0;
                background-color: #f5f7fb;
                font-family: Arial, Helvetica, sans-serif;
                color: #1f2937;
            "
        >
            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background-color: #f5f7fb; padding: 40px 16px;"
            >
                <tr>
                    <td align="center">

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                max-width: 600px;
                                background-color: #ffffff;
                                border-radius: 16px;
                                overflow: hidden;
                                border: 1px solid #e5e7eb;
                            "
                        >

                            <!-- Header -->
                            <tr>
                                <td
                                    style="
                                        padding: 32px 32px 28px;
                                        text-align: center;
                                        background-color: #ffffff;
                                        border-bottom: 1px solid #eef0f4;
                                    "
                                >
                                    <div
                                        style="
                                            display: inline-block;
                                            font-size: 28px;
                                            font-weight: 700;
                                            letter-spacing: -0.5px;
                                            color: #111827;
                                        "
                                    >
                                        Skill<span style="color: #4f46e5;">Kwiz</span>
                                    </div>

                                    <p
                                        style="
                                            margin: 10px 0 0;
                                            font-size: 14px;
                                            color: #6b7280;
                                        "
                                    >
                                        Employee Account
                                    </p>
                                </td>
                            </tr>

                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 36px 32px;">

                                    <h1
                                        style="
                                            margin: 0 0 16px;
                                            font-size: 26px;
                                            line-height: 1.3;
                                            color: #111827;
                                        "
                                    >
                                        Welcome to SkillKwiz
                                    </h1>

                                    <p
                                        style="
                                            margin: 0 0 18px;
                                            font-size: 16px;
                                            line-height: 1.7;
                                            color: #4b5563;
                                        "
                                    >
                                        Hello ${fullName},
                                    </p>

                                    <p
                                        style="
                                            margin: 0 0 28px;
                                            font-size: 15px;
                                            line-height: 1.7;
                                            color: #4b5563;
                                        "
                                    >
                                        Your SkillKwiz employee account has been
                                        created by your employer. You can use the
                                        credentials below to sign in to your account.
                                    </p>

                                    <!-- Credentials Box -->
                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            background-color: #f8f9ff;
                                            border: 1px solid #e5e7eb;
                                            border-radius: 12px;
                                            margin-bottom: 28px;
                                        "
                                    >
                                        <tr>
                                            <td style="padding: 24px;">

                                                <p
                                                    style="
                                                        margin: 0 0 18px;
                                                        font-size: 15px;
                                                        font-weight: 700;
                                                        color: #111827;
                                                    "
                                                >
                                                    Your Sign-In Credentials
                                                </p>

                                                <!-- Employee ID -->
                                                <table
                                                    width="100%"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    border="0"
                                                    style="margin-bottom: 12px;"
                                                >
                                                    <tr>
                                                        <td
                                                            style="
                                                                padding: 14px 16px;
                                                                background-color: #ffffff;
                                                                border: 1px solid #e5e7eb;
                                                                border-radius: 8px;
                                                            "
                                                        >
                                                            <p
                                                                style="
                                                                    margin: 0 0 5px;
                                                                    font-size: 12px;
                                                                    color: #6b7280;
                                                                "
                                                            >
                                                                Employee ID
                                                            </p>

                                                            <p
                                                                style="
                                                                    margin: 0;
                                                                    font-size: 16px;
                                                                    font-weight: 700;
                                                                    letter-spacing: 0.5px;
                                                                    color: #111827;
                                                                "
                                                            >
                                                                ${employeeId}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Temporary Password -->
                                                <table
                                                    width="100%"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    border="0"
                                                >
                                                    <tr>
                                                        <td
                                                            style="
                                                                padding: 14px 16px;
                                                                background-color: #ffffff;
                                                                border: 1px solid #e5e7eb;
                                                                border-radius: 8px;
                                                            "
                                                        >
                                                            <p
                                                                style="
                                                                    margin: 0 0 5px;
                                                                    font-size: 12px;
                                                                    color: #6b7280;
                                                                "
                                                            >
                                                                Temporary Password
                                                            </p>

                                                            <p
                                                                style="
                                                                    margin: 0;
                                                                    font-size: 16px;
                                                                    font-weight: 700;
                                                                    letter-spacing: 0.5px;
                                                                    color: #111827;
                                                                    word-break: break-all;
                                                                "
                                                            >
                                                                ${temporaryPassword}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>

                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Security Notice -->
                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            margin-bottom: 28px;
                                            background-color: #fffbeb;
                                            border: 1px solid #fde68a;
                                            border-radius: 10px;
                                        "
                                    >
                                        <tr>
                                            <td style="padding: 16px 18px;">

                                                <p
                                                    style="
                                                        margin: 0 0 6px;
                                                        font-size: 14px;
                                                        font-weight: 700;
                                                        color: #92400e;
                                                    "
                                                >
                                                    Important
                                                </p>

                                                <p
                                                    style="
                                                        margin: 0;
                                                        font-size: 13px;
                                                        line-height: 1.6;
                                                        color: #92400e;
                                                    "
                                                >
                                                    This is a temporary password.
                                                    You will be required to verify
                                                    your email address and create a
                                                    new password before receiving
                                                    complete access to SkillKwiz.
                                                </p>

                                            </td>
                                        </tr>
                                    </table>

                                    <p
                                        style="
                                            margin: 0 0 12px;
                                            font-size: 15px;
                                            line-height: 1.7;
                                            color: #4b5563;
                                        "
                                    >
                                        Please keep your login credentials secure
                                        and do not share your temporary password
                                        with anyone.
                                    </p>

                                    <p
                                        style="
                                            margin: 28px 0 0;
                                            font-size: 15px;
                                            line-height: 1.7;
                                            color: #4b5563;
                                        "
                                    >
                                        Regards,<br />
                                        <strong style="color: #111827;">
                                            SkillKwiz Team
                                        </strong>
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td
                                    style="
                                        padding: 22px 32px;
                                        background-color: #f9fafb;
                                        border-top: 1px solid #eef0f4;
                                        text-align: center;
                                    "
                                >
                                    <p
                                        style="
                                            margin: 0;
                                            font-size: 12px;
                                            line-height: 1.6;
                                            color: #9ca3af;
                                        "
                                    >
                                        This email was sent because an employee
                                        account was created for you on SkillKwiz.
                                    </p>

                                    <p
                                        style="
                                            margin: 8px 0 0;
                                            font-size: 12px;
                                            color: #9ca3af;
                                        "
                                    >
                                        © ${new Date().getFullYear()} SkillKwiz.
                                        All rights reserved.
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
