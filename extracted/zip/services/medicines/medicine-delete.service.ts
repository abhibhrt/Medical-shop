import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";

export async function deleteMedicineService(
  id: string,
  shopId: string,
  executor: DbExecutor = pool
): Promise<{ message: string }> {
  if (isPool(executor)) {
    return withTransaction((client) => executeDeleteMedicine(id, shopId, client), executor);
  }
  return executeDeleteMedicine(id, shopId, executor);
}

async function executeDeleteMedicine(
  id: string,
  shopId: string,
  client: PoolClient
): Promise<{ message: string }> {
  const existing = await client.query<{ id: string }>(
    `SELECT id FROM medicines WHERE id = $1 AND shop_id = $2 LIMIT 1`,
    [id, shopId]
  );

  if (existing.rows.length === 0) {
    throw AppError.notFound("Medicine");
  }

  await client.query(`DELETE FROM medicines WHERE id = $1 AND shop_id = $2`, [id, shopId]);

  return { message: "Medicine removed successfully" };
}