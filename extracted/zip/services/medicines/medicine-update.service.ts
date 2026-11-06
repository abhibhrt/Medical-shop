import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";
import type { Medicine, UpdateMedicineInput } from "@/types";

export async function updateMedicineService(
  input: UpdateMedicineInput,
  executor: DbExecutor = pool
): Promise<Medicine> {
  if (isPool(executor)) {
    return withTransaction((client) => executeUpdateMedicine(input, client), executor);
  }
  return executeUpdateMedicine(input, executor);
}

async function executeUpdateMedicine(
  input: UpdateMedicineInput,
  client: PoolClient
): Promise<Medicine> {
  const { id, shopId, ...updates } = input;

  const existing = await client.query<Medicine>(
    `SELECT * FROM medicines WHERE id = $1 AND shop_id = $2 LIMIT 1`,
    [id, shopId]
  );

  if (existing.rows.length === 0) {
    throw AppError.notFound("Medicine");
  }

  const currentMed = existing.rows[0];
  const targetBatch = updates.batchNo ? updates.batchNo.trim() : currentMed.batch_no;
  const targetHsn = updates.hsnCode ? updates.hsnCode.trim() : currentMed.hsn_code;

  if (updates.batchNo || updates.hsnCode) {
    const duplicateCheck = await client.query<{ id: string }>(
      `SELECT id FROM medicines 
       WHERE shop_id = $1 AND batch_no = $2 AND hsn_code = $3 AND id != $4 
       LIMIT 1`,
      [shopId, targetBatch, targetHsn, id]
    );

    if (duplicateCheck.rows.length > 0) {
      throw AppError.conflict(
        "Another item already uses this Batch Number and HSN Code in this shop"
      );
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  const mapping: Record<keyof Omit<UpdateMedicineInput, "id" | "shopId">, string> = {
    description: "description",
    batchNo: "batch_no",
    mrp: "mrp",
    rate: "rate",
    gstRate: "gst_rate",
    expDate: "exp_date",
    quantity: "quantity",
    hsnCode: "hsn_code",
    packSize: "pack_size",
  };

  for (const [key, column] of Object.entries(mapping)) {
    const rawValue = updates[key as keyof typeof mapping];
    if (rawValue !== undefined) {
      fields.push(`${column} = $${index++}`);
      values.push(typeof rawValue === "string" ? rawValue.trim() : rawValue);
    }
  }

  if (fields.length === 0) {
    return currentMed;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id, shopId);

  const queryText = `
    UPDATE medicines 
    SET ${fields.join(", ")}
    WHERE id = $${index++} AND shop_id = $${index}
    RETURNING *
  `;

  const res = await client.query<Medicine>(queryText, values);
  return res.rows[0];
}