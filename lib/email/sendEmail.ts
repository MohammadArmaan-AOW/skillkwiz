import nodemailer from "nodemailer";

// ── Gmail ────────────────────────────────────────────────────────
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

// ── Outlook ──────────────────────────────────────────────────────
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// ── Toggle here ──────────────────────────────────────────────────
const USE_OUTLOOK = true; // false = Gmail

if (USE_OUTLOOK) {
    if (!smtpUser) throw new Error("Please define SMTP_USER in .env.local");
    if (!smtpPass) throw new Error("Please define SMTP_PASS in .env.local");
} else {
    if (!gmailEmail) throw new Error("Please define GMAIL_EMAIL in .env.local");
    if (!gmailAppPassword) throw new Error("Please define GMAIL_APP_PASSWORD in .env.local");
}

export const mailTransporter = USE_OUTLOOK
    ? nodemailer.createTransport({
                host: "smtpout.secureserver.net",
                port: 465,
                secure: true,
                auth: { user: smtpUser, pass: smtpPass },
            })
    : nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
              user: gmailEmail,
              pass: gmailAppPassword,
          },
      });

// From must always match whichever account is authenticated
export const EMAIL_FROM = USE_OUTLOOK
    ? `SkillKwiz <${smtpUser}>`
    : `SkillKwiz <${gmailEmail}>`;

type SendEmailOptions = {
    to: string;
    subject: string;
    html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    try {
        const result = await mailTransporter.sendMail({
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
        console.error("EMAIL SEND ERROR:", error);
        throw error;
    }
}