import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

import { connectDB } from "@/lib/db/db";
import Employer from "@/lib/db/employerSchema";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const JWT_SECRET = process.env.JWT_SECRET!;

const googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
);

const OAUTH_STATE_COOKIE = "skillkwiz_google_oauth_state";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const code = searchParams.get("code");
        const returnedState = searchParams.get("state");
        const error = searchParams.get("error");

        /*
         * ---------------------------------------------------------
         * STEP 1
         * Initial request -> redirect to Google.
         * ---------------------------------------------------------
         */
        if (!code) {
            if (error) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Google authentication failed: ${error}`,
                    },
                    { status: 400 },
                );
            }

            /*
             * Generate CSRF protection state.
             */
            const state = crypto.randomBytes(32).toString("hex");

            const authorizationUrl = googleClient.generateAuthUrl({
                access_type: "offline",
                scope: ["openid", "email", "profile"],
                prompt: "select_account",
                state,
            });

            const response = NextResponse.redirect(authorizationUrl);

            response.cookies.set({
                name: OAUTH_STATE_COOKIE,
                value: state,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 10 * 60,
            });

            return response;
        }

        /*
         * ---------------------------------------------------------
         * STEP 2
         * Validate OAuth state.
         * ---------------------------------------------------------
         */

        const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

        if (!storedState || !returnedState || storedState !== returnedState) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Google authentication request.",
                },
                { status: 400 },
            );
        }

        /*
         * ---------------------------------------------------------
         * STEP 3
         * Exchange authorization code for tokens.
         * ---------------------------------------------------------
         */

        const { tokens } = await googleClient.getToken(code);

        if (!tokens.id_token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Google did not return a valid identity token.",
                },
                { status: 400 },
            );
        }

        /*
         * ---------------------------------------------------------
         * STEP 4
         * Verify Google ID token.
         * ---------------------------------------------------------
         */

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to verify Google account.",
                },
                { status: 400 },
            );
        }

        const googleId = payload.sub;
        const email = payload.email;
        const emailVerified = payload.email_verified;
        const fullName = payload.name || "Employer";
        const profilePhoto = payload.picture;

        /*
         * ---------------------------------------------------------
         * STEP 5
         * Validate Google identity.
         * ---------------------------------------------------------
         */

        if (!googleId || !email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Google account is missing required information.",
                },
                { status: 400 },
            );
        }

        if (!emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Google email address is not verified.",
                },
                { status: 403 },
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        /*
         * ---------------------------------------------------------
         * STEP 6
         * Connect database.
         * ---------------------------------------------------------
         */

        await connectDB();

        /*
         * ---------------------------------------------------------
         * STEP 7
         * IMPORTANT:
         * Only an EXISTING employer can login.
         *
         * We DO NOT create an employer here.
         * ---------------------------------------------------------
         */

        const employer = await Employer.findOne({
            email: normalizedEmail,
        });

        if (!employer) {
            const frontendUrl =
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            const loginUrl = new URL("/login", frontendUrl);

            loginUrl.searchParams.set("role", "employer");

            loginUrl.searchParams.set("error", "google_account_not_registered");

            const response = NextResponse.redirect(loginUrl);

            response.cookies.set({
                name: OAUTH_STATE_COOKIE,
                value: "",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });

            return response;
        }

        /*
         * ---------------------------------------------------------
         * STEP 8
         * Verify / link Google account.
         * ---------------------------------------------------------
         */

        if (employer.googleId && employer.googleId !== googleId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This employer account is already linked to a different Google account.",
                },
                { status: 403 },
            );
        }

        let shouldSave = false;

        /*
         * Existing email/password employer can
         * connect Google to the same account.
         */
        if (!employer.googleId) {
            employer.googleId = googleId;
            shouldSave = true;
        }

        /*
         * Google has verified the email.
         */
        if (!employer.emailVerified) {
            employer.emailVerified = true;
            shouldSave = true;
        }

        /*
         * Update Google profile photo when available.
         */
        if (profilePhoto && employer.profilePhoto !== profilePhoto) {
            employer.profilePhoto = profilePhoto;

            shouldSave = true;
        }

        /*
         * Keep the auth provider consistent.
         */
        if (employer.authProvider !== "google") {
            employer.authProvider = "google";
            shouldSave = true;
        }

        if (shouldSave) {
            await employer.save();
        }

        /*
         * ---------------------------------------------------------
         * STEP 9
         * Generate SkillKwiz employer JWT.
         * ---------------------------------------------------------
         */

        const token = jwt.sign(
            {
                employerId: employer._id.toString(),

                email: employer.email,

                authProvider: employer.authProvider,
            },
            JWT_SECRET,
            {
                expiresIn: "7d",
            },
        );

        /*
         * ---------------------------------------------------------
         * STEP 10
         * Redirect to employer dashboard.
         * ---------------------------------------------------------
         */

        const frontendUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const response = NextResponse.redirect(
            `${frontendUrl}/services/employer/profile`,
        );

        /*
         * Set authentication cookie.
         */
        response.cookies.set({
            name: "skillkwiz_employer_token",

            value: token,

            httpOnly: true,

            secure: process.env.NODE_ENV === "production",

            sameSite: "lax",

            path: "/",

            maxAge: 7 * 24 * 60 * 60,
        });

        /*
         * Remove OAuth state cookie.
         */
        response.cookies.set({
            name: OAUTH_STATE_COOKIE,
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error("Employer Google authentication error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Google authentication failed.",
            },
            { status: 500 },
        );
    }
}
