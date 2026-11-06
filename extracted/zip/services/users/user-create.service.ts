import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password.util";
import { AppError } from "@/lib/api/app-error";
import { findUserByCriteria } from "./user-find.service";
import type { CreateUserInput, User } from "@/types";

export async function createUserService(
  input: CreateUserInput,
  executor: DbExecutor = pool
): Promise<User> {
  if (isPool(executor)) {
    return withTransaction((client) => executeCreateUser(input, client), executor);
  }
  return executeCreateUser(input, executor);
}

async function executeCreateUser(
  input: CreateUserInput,
  client: PoolClient
): Promise<User> {
  const { name, email, mobNo, password, role = "CUSTOMER", address } = input;

  const existing = await findUserByCriteria({ email, mobNo }, client);
  if (existing) {
    throw AppError.conflict("User with this email or mobile number already exists");
  }

  let addressId: string | null = null;

  if (address?.pincode && address?.state) {
    const addressRes = await client.query<{ id: string }>(
      `INSERT INTO addresses (pincode, state, country, district, area)
       VALUES ($1, $2, COALESCE($3, 'IN'), $4, $5)
       RETURNING id`,
      [address.pincode, address.state, address.country ?? "IN", address.district, address.area]
    );
    addressId = addressRes.rows[0].id;
  }

  const hashedPassword = await hashPassword(password);

  const userRes = await client.query<User>(
    `INSERT INTO users (name, email, mob_no, password, role, status, is_profile_complete, address_id)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', false, $6)
     RETURNING id, name, email, mob_no, role, status, is_profile_complete, address_id, created_at, updated_at`,
    [name.trim(), email.toLowerCase().trim(), mobNo.trim(), hashedPassword, role, addressId]
  );

  return userRes.rows[0];
}