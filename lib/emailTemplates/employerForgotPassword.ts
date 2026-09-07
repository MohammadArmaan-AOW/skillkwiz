interface EmployerForgotPasswordProps {
    fullName: string;
    resetUrl: string;
}

export function employerForgotPasswordTemplate({
    fullName,
    resetUrl,
}: EmployerForgotPasswordProps) {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <title>Reset your SkillKwiz password</title>
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fb;
        font-family: Arial, Helvetica, sans-serif;
    "
>
    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
            background-color: #f5f7fb;
            padding: 40px 20px;
        "
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
                        border-radius: 12px;
                        border: 1px solid #e5e7eb;
                    "
                >

                    <tr>
                        <td
                            style="
                                padding: 32px 40px 20px;
                                text-align: center;
                            "
                        >
                            <h1
                                style="
                                    margin: 0;
                                    font-size: 28px;
                                    font-weight: 700;
                                    color: #111827;
                                "
                            >
                                SkillKwiz
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 20px 40px 40px;
                            "
                        >

                            <h2
                                style="
                                    margin: 0 0 20px;
                                    font-size: 22px;
                                    color: #111827;
                                "
                            >
                                Reset your password
                            </h2>

                            <p
                                style="
                                    margin: 0 0 16px;
                                    font-size: 16px;
                                    line-height: 1.6;
                                    color: #374151;
                                "
                            >
                                Hi ${fullName},
                            </p>

                            <p
                                style="
                                    margin: 0 0 28px;
                                    font-size: 16px;
                                    line-height: 1.6;
                                    color: #374151;
                                "
                            >
                                We received a request to reset
                                your SkillKwiz employer account
                                password.
                            </p>

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="margin-bottom: 28px;"
                            >
                                <tr>
                                    <td align="center">

                                        <a
                                            href="${resetUrl}"
                                            style="
                                                display: inline-block;
                                                padding: 14px 28px;
                                                background-color: #111827;
                                                color: #ffffff;
                                                text-decoration: none;
                                                border-radius: 8px;
                                                font-size: 15px;
                                                font-weight: 600;
                                            "
                                        >
                                            Reset Password
                                        </a>

                                    </td>
                                </tr>
                            </table>

                            <p
                                style="
                                    margin: 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #6b7280;
                                "
                            >
                                This password reset link will
                                expire in
                                <strong>10 minutes</strong>.
                            </p>

                            <p
                                style="
                                    margin: 24px 0 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #6b7280;
                                "
                            >
                                If you didn't request a password
                                reset, you can safely ignore this
                                email.
                            </p>

                            <hr
                                style="
                                    margin: 32px 0 20px;
                                    border: 0;
                                    border-top: 1px solid #e5e7eb;
                                "
                            />

                            <p
                                style="
                                    margin: 0;
                                    text-align: center;
                                    font-size: 12px;
                                    color: #9ca3af;
                                "
                            >
                                © ${new Date().getFullYear()}
                                SkillKwiz
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
