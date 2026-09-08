import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    throw new Error("Please define RESEND_API_KEY in .env.local");
}

export const resend = new Resend(resendApiKey);

export const EMAIL_FROM = "SkillKwiz <no-reply@skillkwiz.co.in>";