interface EmployerVerificationOtpProps {
    fullName: string;
    otp: string;
}

export function employerVerificationOtpTemplate({
    fullName,
    otp,
}: EmployerVerificationOtpProps) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <title>Verify your SkillKwiz account</title>
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
        style="background-color: #f5f7fb; padding: 40px 20px;"
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
                    <!-- Header -->
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

                    <!-- Content -->
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
                                Verify your email address
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
                                    margin: 0 0 24px;
                                    font-size: 16px;
                                    line-height: 1.6;
                                    color: #374151;
                                "
                            >
                                Thank you for creating your SkillKwiz
                                employer account. Please use the
                                verification code below to verify your
                                email address.
                            </p>

                            <!-- OTP -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >
                                <tr>
                                    <td align="center">
                                        <div
                                            style="
                                                display: inline-block;
                                                padding: 18px 28px;
                                                background-color: #f3f4f6;
                                                border-radius: 10px;
                                                font-size: 32px;
                                                font-weight: 700;
                                                letter-spacing: 8px;
                                                color: #111827;
                                            "
                                        >
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p
                                style="
                                    margin: 24px 0 0;
                                    text-align: center;
                                    font-size: 14px;
                                    color: #6b7280;
                                "
                            >
                                This code will expire in
                                <strong>10 minutes</strong>.
                            </p>

                            <p
                                style="
                                    margin: 28px 0 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #6b7280;
                                "
                            >
                                If you didn't create a SkillKwiz account,
                                you can safely ignore this email.
                            </p>

                            <hr
                                style="
                                    margin: 32px 0;
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
                                © ${new Date().getFullYear()} SkillKwiz
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
