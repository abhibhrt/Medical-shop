/**
 * Shared base fields present on all database entities.
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Core Address entity stored in the database.
 */
export interface Address extends BaseEntity {
  pincode: string;
  state: string;
  country: string;
  district: string;
  area: string;
}

/**
 * Payload for creating or replacing an address.
 */
export interface AddressInput {
  pincode: string;
  state: string;
  country?: string;
  district: string;
  area: string;
}

/**
 * Payload for partially updating an address.
 */
export type UpdateAddressInput = Partial<AddressInput>;

/**
 * Standard query parameters for paginated list endpoints.
 */
export interface PaginationParams {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Standard paginated list response structure.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Unified API Response envelope used by all Next.js Route Handlers.
 */
export type ApiResponse<T = unknown> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    };