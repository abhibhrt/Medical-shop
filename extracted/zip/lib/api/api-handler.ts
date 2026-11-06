import { NextResponse } from "next/server";
import { AppError } from "./app-error";
import type { ApiResponse } from "@/types";

/**
 * Helper to create a standardized JSON success response.
 */
export function sendSuccess<T>(
  data: T,
  message?: string,
  status: number = 200,
  headers?: HeadersInit
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    },
    { status, headers }
  );
}

/**
 * Helper to create a standardized JSON error response.
 */
export function sendError(
  error: unknown,
  headers?: HeadersInit
): NextResponse<ApiResponse<never>> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode, headers }
    );
  }

  // Handle PostgreSQL unique constraint violation (code 23505)
  if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CONFLICT",
          message: "A record with these details already exists.",
        },
      },
      { status: 409, headers }
    );
  }

  console.error("❌ [Unhandled API Error]:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected server error occurred. Please try again later.",
      },
    },
    { status: 500, headers }
  );
}

/**
 * Higher-order wrapper for Next.js App Router API handlers.
 * Automatically catches operational and unexpected errors.
 */
export function withApiHandler<TContext = unknown>(
  handler: (req: Request, context: TContext) => Promise<NextResponse>
) {
  return async (req: Request, context: TContext): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return sendError(error);
    }
  };
}