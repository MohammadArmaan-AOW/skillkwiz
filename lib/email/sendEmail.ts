import nodemailer from "nodemailer";

const gmailEmail = process.env.GMAIL_EMAIL;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailEmail) {
    throw new Error("Please define GMAIL_EMAIL in .env.local");
}

if (!gmailAppPassword) {
    throw new Error("Please define GMAIL_APP_PASSWORD in .env.local");
}

export const mailTransporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: gmailEmail,

        pass: gmailAppPassword,
    },
});

export const EMAIL_FROM = `SkillKwiz <${gmailEmail}>`;

type SendEmailOptions = {
    to: string;
    subject: string;
    html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    return mailTransporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html,
    });
}
