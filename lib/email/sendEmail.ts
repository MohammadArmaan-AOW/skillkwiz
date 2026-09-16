import nodemailer from "nodemailer";

const gmailEmail = process.env.GMAIL_EMAIL;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailEmail) {
    throw new Error(
        "Please define GMAIL_EMAIL in .env.local",
    );
}

if (!gmailAppPassword) {
    throw new Error(
        "Please define GMAIL_APP_PASSWORD in .env.local",
    );
}

export const mailTransporter =
    nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: gmailEmail,
            pass: gmailAppPassword,
        },
    });

// export const mailTransporter =nodemailer.createTransport({
//     host: "smtp-mail.outlook.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
// });

export const EMAIL_FROM = `SkillKwiz <${gmailEmail}>`;

type SendEmailOptions = {
    to: string;
    subject: string;
    html: string;
};

export async function sendEmail({
    to,
    subject,
    html,
}: SendEmailOptions) {
    try {
        const result =
            await mailTransporter.sendMail({
                from: EMAIL_FROM,
                to,
                subject,
                html,
            });

        console.log("EMAIL SENT:", {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
            response: result.response,
        });

        return result;
    } catch (error) {
        console.error(
            "EMAIL SEND ERROR:",
            error,
        );

        throw error;
    }
}