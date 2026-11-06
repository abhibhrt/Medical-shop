import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env";
import { JWT_EXPIRES_IN } from "@/config/constants";
import type { SessionPayload, UserRole } from "@/types";

function getEncodedSecret(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

/**
 * Signs a JWT token containing the user's session payload.
 */
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    ...(payload.role ? { role: payload.role } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getEncodedSecret());
}

/**
 * Verifies a JWT token and extracts the typed SessionPayload.
 * Returns null if the token is expired, malformed, or invalid.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub || typeof payload.email !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      ...(typeof payload.role === "string" ? { role: payload.role as UserRole } : {}),
    };
  } catch {
    return null;
  }
}