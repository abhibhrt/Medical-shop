import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password.util";
import { AppError } from "@/lib/api/app-error";
import { findUserByCriteria } from "./user-find.service";
import { getUserProfileById } from "./user-profile.service";
import type { UpdateUserInput, UserProfileResponse } from "@/types";

export async function updateUserService(
  userId: string,
  input: UpdateUserInput,
  executor: DbExecutor = pool
): Promise<UserProfileResponse> {
  if (isPool(executor)) {
    return withTransaction((client) => executeUpdateUser(userId, input, client), executor);
  }
  return executeUpdateUser(userId, input, executor);
}

async function executeUpdateUser(
  userId: string,
  input: UpdateUserInput,
  client: PoolClient
): Promise<UserProfileResponse> {
  const { name, mobNo, password, role, status, isProfileComplete, address } = input;

  const userCheckRes = await client.query<{ id: string; address_id: string | null }>(
    `SELECT id, address_id FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );

  if (userCheckRes.rows.length === 0) {
    throw AppError.notFound("User");
  }

  let addressId = userCheckRes.rows[0].address_id;

  if (mobNo) {
    const existingMobileUser = await findUserByCriteria({ mobNo }, client);
    if (existingMobileUser && existingMobileUser.id !== userId) {
      throw AppError.conflict("Mobile number is already in use by another account");
    }
  }

  if (address) {
    if (addressId) {
      await client.query(
        `UPDATE addresses
         SET pincode = COALESCE($1, pincode),
             state = COALESCE($2, state),
             country = COALESCE($3, country),
             district = COALESCE($4, district),
             area = COALESCE($5, area),
             updated_at = NOW()
         WHERE id = $6`,
        [address.pincode, address.state, address.country, address.district, address.area, addressId]
      );
    } else if (address.pincode && address.state) {
      const addressRes = await client.query<{ id: string }>(
        `INSERT INTO addresses (pincode, state, country, district, area)
         VALUES ($1, $2, COALESCE($3, 'IN'), $4, $5)
         RETURNING id`,
        [address.pincode, address.state, address.country ?? "IN", address.district, address.area]
      );
      addressId = addressRes.rows[0].id;
    }
  }

  const updateFields: string[] = [];
  const queryParams: unknown[] = [];
  let paramIdx = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramIdx++}`);
    queryParams.push(name.trim());
  }

  if (mobNo !== undefined) {
    updateFields.push(`mob_no = $${paramIdx++}`);
    queryParams.push(mobNo.trim());
  }

  if (password !== undefined) {
    const hashedPassword = await hashPassword(password);
    updateFields.push(`password = $${paramIdx++}`);
    queryParams.push(hashedPassword);
  }

  if (role !== undefined) {
    updateFields.push(`role = $${paramIdx++}`);
    queryParams.push(role);
  }

  if (status !== undefined) {
    updateFields.push(`status = $${paramIdx++}`);
    queryParams.push(status);
  }

  if (isProfileComplete !== undefined) {
    updateFields.push(`is_profile_complete = $${paramIdx++}`);
    queryParams.push(isProfileComplete);
  }

  if (addressId !== userCheckRes.rows[0].address_id) {
    updateFields.push(`address_id = $${paramIdx++}`);
    queryParams.push(addressId);
  }

  if (updateFields.length > 0) {
    updateFields.push(`updated_at = NOW()`);
    queryParams.push(userId);

    await client.query(
      `UPDATE users
       SET ${updateFields.join(", ")}
       WHERE id = $${paramIdx}`,
      queryParams
    );
  }

  const updatedProfile = await getUserProfileById(userId, client);
  if (!updatedProfile) {
    throw AppError.notFound("User");
  }

  return updatedProfile;
}