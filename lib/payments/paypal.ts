const PAYPAL_ENVIRONMENT =
    process.env.PAYPAL_ENVIRONMENT ?? "sandbox";

export const PAYPAL_BASE_URL =
    PAYPAL_ENVIRONMENT === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

let cachedAccessToken: string | null = null;
let accessTokenExpiresAt = 0;

export async function getPayPalAccessToken(): Promise<string> {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET =
        process.env.PAYPAL_CLIENT_SECRET;

    if (!PAYPAL_CLIENT_ID) {
        throw new Error(
            "PAYPAL_CLIENT_ID is not configured.",
        );
    }

    if (!PAYPAL_CLIENT_SECRET) {
        throw new Error(
            "PAYPAL_CLIENT_SECRET is not configured.",
        );
    }

    const now = Date.now();

    if (
        cachedAccessToken &&
        accessTokenExpiresAt > now + 60_000
    ) {
        return cachedAccessToken;
    }

    const credentials = Buffer.from(
        `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");

    const response = await fetch(
        `${PAYPAL_BASE_URL}/v1/oauth2/token`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
            cache: "no-store",
        },
    );

    if (!response.ok) {
        const errorText = await response.text();

        console.error(
            "PayPal access token error:",
            errorText,
        );

        throw new Error(
            "Failed to authenticate with PayPal.",
        );
    }

    const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
    };

    cachedAccessToken = data.access_token;

    accessTokenExpiresAt =
        now + data.expires_in * 1000;

    return data.access_token;
}