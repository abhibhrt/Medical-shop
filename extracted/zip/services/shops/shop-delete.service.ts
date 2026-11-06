import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";

export async function deleteShopService(
  ownerId: string,
  executor: DbExecutor = pool
): Promise<{ message: string }> {
  if (isPool(executor)) {
    return withTransaction((client) => executeDeleteShop(ownerId, client), executor);
  }
  return executeDeleteShop(ownerId, executor);
}

async function executeDeleteShop(
  ownerId: string,
  client: PoolClient
): Promise<{ message: string }> {
  const shopRes = await client.query<{ id: string; address_id: string | null }>(
    `SELECT id, address_id FROM shops WHERE owner_id = $1 LIMIT 1`,
    [ownerId]
  );

  if (shopRes.rows.length === 0) {
    throw AppError.notFound("Shop");
  }

  const { id: shopId, address_id: addressId } = shopRes.rows[0];

  const invoiceCheck = await client.query<{ id: string }>(
    `SELECT id FROM invoices WHERE shop_id = $1 LIMIT 1`,
    [shopId]
  );

  if (invoiceCheck.rows.length > 0) {
    throw AppError.conflict(
      "Cannot delete shop with existing invoice records. Consider archiving or contacting support."
    );
  }

  await client.query(`DELETE FROM shops WHERE id = $1`, [shopId]);

  if (addressId) {
    await client.query(`DELETE FROM addresses WHERE id = $1`, [addressId]);
  }

  await client.query(
    `UPDATE users 
     SET role = 'CUSTOMER', updated_at = NOW() 
     WHERE id = $1 AND role = 'ADMIN'`,
    [ownerId]
  );

  return { message: "Shop deleted successfully" };
}