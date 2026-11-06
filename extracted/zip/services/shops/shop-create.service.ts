import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";
import type { Address, CreateShopInput, Shop, ShopResponse } from "@/types";

export async function createShopService(
  input: CreateShopInput,
  executor: DbExecutor = pool
): Promise<ShopResponse> {
  if (isPool(executor)) {
    return withTransaction((client) => executeCreateShop(input, client), executor);
  }
  return executeCreateShop(input, executor);
}

async function executeCreateShop(
  input: CreateShopInput,
  client: PoolClient
): Promise<ShopResponse> {
  const {
    ownerId,
    shopName,
    phone,
    email,
    drugLicenceNumber,
    pharmacistName,
    pharmacistRegistrationNumber,
    gstin,
    address,
    imageId = null,
  } = input;

  const existingShop = await client.query<{ id: string }>(
    `SELECT id FROM shops WHERE owner_id = $1 LIMIT 1`,
    [ownerId]
  );

  if (existingShop.rows.length > 0) {
    throw AppError.conflict("A user can only create and manage a single shop");
  }

  if (!address?.pincode || !address?.state || !address?.district || !address?.area) {
    throw new AppError("Complete shop address is required", 400, "VALIDATION_ERROR");
  }

  const addressRes = await client.query<Address>(
    `INSERT INTO addresses (pincode, state, country, district, area)
     VALUES ($1, $2, COALESCE($3, 'IN'), $4, $5)
     RETURNING id, pincode, state, country, district, area, created_at, updated_at`,
    [address.pincode.trim(), address.state.trim(), address.country ?? "IN", address.district.trim(), address.area.trim()]
  );
  const shopAddress = addressRes.rows[0];

  const shopRes = await client.query<Shop>(
    `INSERT INTO shops (
      shop_name, phone, email, drug_licence_number,
      pharmacist_name, pharmacist_registration_number,
      gstin, owner_id, address_id, image_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      shopName.trim(),
      phone.trim(),
      email.toLowerCase().trim(),
      drugLicenceNumber.trim(),
      pharmacistName.trim(),
      pharmacistRegistrationNumber.trim(),
      gstin.trim(),
      ownerId,
      shopAddress.id,
      imageId,
    ]
  );

  await client.query(
    `UPDATE users 
     SET role = 'ADMIN', updated_at = NOW() 
     WHERE id = $1 AND role NOT IN ('ADMIN', 'SUPERADMIN')`,
    [ownerId]
  );

  return {
    ...shopRes.rows[0],
    address: shopAddress,
  };
}