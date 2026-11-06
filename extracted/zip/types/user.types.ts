import type { Address, AddressInput, BaseEntity, UpdateAddressInput } from "./common.types";

export type UserRole = "CUSTOMER" | "PHARMACIST" | "ADMIN" | "SUPERADMIN";
export type UserStatus = "ACTIVE" | "DEACTIVATED" | "SUSPENDED";

/**
 * Core User database entity.
 */
export interface User extends BaseEntity {
  name: string;
  email: string;
  mob_no: string;
  role: UserRole;
  status: UserStatus;
  is_profile_complete: boolean;
  address_id: string | null;
}

/**
 * Internal type used strictly during authentication verification.
 */
export interface UserWithPassword extends User {
  password?: string;
}

/**
 * Public-safe user profile returned by API endpoints (includes joined address).
 */
export interface UserProfileResponse extends Omit<User, "address_id"> {
  address?: Address | null;
}

/**
 * JWT Session payload encoded inside HTTP-only auth cookies.
 */
export interface SessionPayload {
  userId: string;
  email: string;
  role?: UserRole;
}

/**
 * Input payload for user registration (Sign Up).
 */
export interface CreateUserInput {
  name: string;
  email: string;
  mobNo: string;
  password: string;
  role?: UserRole;
  address?: AddressInput;
}

/**
 * Input payload for user login (Sign In).
 */
export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Input payload for updating user profile or status.
 */
export interface UpdateUserInput {
  name?: string;
  mobNo?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  isProfileComplete?: boolean;
  address?: UpdateAddressInput;
}