import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { env } from "@/config/env";
import { AUTH_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/config/constants";

export const defaultAuthCookieOptions: Omit<ResponseCookie, "name" | "value"> = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};

/**
 * Attaches the HTTP-only auth token cookie to a NextResponse instance.
 */
export function setAuthCookieOnResponse(
  response: NextResponse,
  token: string,
  options: Partial<ResponseCookie> = {}
): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    ...defaultAuthCookieOptions,
    ...options,
  });
  return response;
}

/**
 * Sets the HTTP-only auth token cookie via next/headers (Server Actions / RSC).
 */
export async function setAuthCookie(
  token: string,
  options: Partial<ResponseCookie> = {}
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    ...defaultAuthCookieOptions,
    ...options,
  });
}

/**
 * Clears the auth token cookie on a NextResponse instance.
 */
export function removeAuthCookieFromResponse(response: NextResponse): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    ...defaultAuthCookieOptions,
    maxAge: 0,
  });
  return response;
}

/**
 * Reads the auth token string from incoming request cookies.
 */
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}