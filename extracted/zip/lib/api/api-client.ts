import type { ApiResponse } from "@/types";

/**
 * Standardized client-side HTTP fetcher that automatically unwraps ApiResponse<T>
 * and throws user-friendly Error instances on failure.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const payload: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: `Request failed with status ${response.status}`,
    },
  }));

  if (!response.ok || !payload.success) {
    const errorMessage = !payload.success
      ? payload.error.message
      : `Request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  return payload.data;
}