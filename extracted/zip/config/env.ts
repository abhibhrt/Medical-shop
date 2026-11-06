/**
 * Centralized Environment Configuration.
 * Never access `process.env` directly outside of this file.
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL ?? "";
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export const env = {
  NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
  get isProduction() {
    return this.NODE_ENV === "production";
  },
  get isDevelopment() {
    return this.NODE_ENV === "development";
  },

  // Database & Auth (Required on server)
  get DATABASE_URL() {
    return getRequiredEnv("DATABASE_URL");
  },
  get JWT_SECRET() {
    return getRequiredEnv("JWT_SECRET");
  },

  // Upstash Redis (Optional in development)
  UPSTASH_REDIS_REST_URL: upstashUrl,
  UPSTASH_REDIS_REST_TOKEN: upstashToken,
  get hasUpstashConfig() {
    return (
      Boolean(upstashUrl) &&
      upstashUrl.startsWith("https://") &&
      !upstashUrl.includes("...") &&
      Boolean(upstashToken)
    );
  },
} as const;