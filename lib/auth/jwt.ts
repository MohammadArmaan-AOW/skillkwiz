import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { createHash } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

function getJwtSecret(): string {
    if (!JWT_SECRET) {
        throw new Error("Please define JWT_SECRET in .env.local");
    }

    return JWT_SECRET;
}

export interface EmployerJwtPayload {
    employerId: string;
    email: string;
    role: "employer";
}

export function createEmployerJwt(payload: EmployerJwtPayload): string {
    const secret = getJwtSecret();

    const options: SignOptions = {
        expiresIn: "7d",
    };

    return jwt.sign(payload, secret, options);
}

export function verifyEmployerJwt(token: string): EmployerJwtPayload {
    const secret = getJwtSecret();

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !isEmployerJwtPayload(decoded)) {
        throw new Error("Invalid employer authentication token");
    }

    return decoded;
}

export function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

function isEmployerJwtPayload(
    payload: string | JwtPayload,
): payload is EmployerJwtPayload {
    return (
        typeof payload !== "string" &&
        typeof payload.employerId === "string" &&
        typeof payload.email === "string" &&
        payload.role === "employer"
    );
}

export function createEmployeeJwt(payload: {
    employeeId: string;
    email: string;
    role: "employee";
}) {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });
}
