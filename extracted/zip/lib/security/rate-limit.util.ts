import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import type { ApiResponse } from "@/types";

export const redis = env.hasUpstashConfig ? Redis.fromEnv() : null;

export const limiters = redis
  ? {
      standard: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "rl:std",
      }),
      strict: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "rl:strict",
      }),
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:auth",
      }),
    }
  : null;

export type LimiterTier = "standard" | "strict" | "auth";

interface CheckRateLimitOptions {
  tier?: LimiterTier;
  identifier?: string;
  action?: string;
}

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");

  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Enforces Upstash Redis rate limiting by IP or custom identifier.
 * Gracefully bypasses in development when Upstash credentials are not set.
 */
export async function checkRateLimit(options: CheckRateLimitOptions = {}): Promise<{
  success: boolean;
  errorResponse: NextResponse<ApiResponse<never>> | null;
  headers: Record<string, string>;
}> {
  if (!limiters) {
    if (env.isDevelopment) {
      console.warn("⚠️ Upstash Redis not configured. Rate limiting is bypassed.");
    }
    return { success: true, errorResponse: null, headers: {} };
  }

  const { tier = "standard", identifier, action = "default" } = options;
  const targetId = identifier || (await getClientIp());
  const compositeKey = `${action}:${targetId}`;

  const limiterInstance = limiters[tier];
  const { success, limit, remaining, reset } = await limiterInstance.limit(compositeKey);

  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

  const rateLimitHeaders: Record<string, string> = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  if (!success) {
    const errorResponse = NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
          details: { retryAfter: retryAfterSeconds },
        },
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": retryAfterSeconds.toString(),
        },
      }
    );

    return { success: false, errorResponse, headers: rateLimitHeaders };
  }

  return { success: true, errorResponse: null, headers: rateLimitHeaders };
}