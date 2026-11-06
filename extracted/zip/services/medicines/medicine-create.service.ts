import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";
import type { CreateMedicineInput, Medicine } from "@/types";

export async function createMedicineService(
  input: CreateMedicineInput,
  executor: DbExecutor = pool
): Promise<Medicine> {
  if (isPool(executor)) {
    return withTransaction((client) => executeCreateMedicine(input, client), executor);
  }
  return executeCreateMedicine(input, executor);
}

async function executeCreateMedicine(
  input: CreateMedicineInput,
  client: PoolClient
): Promise<Medicine> {
  const {
    shopId,
    description,
    batchNo,
    mrp,
    rate,
    gstRate,
    expDate,
    quantity,
    hsnCode,
    packSize,
  } = input;

  const existing = await client.query<{ id: string }>(
    `SELECT id FROM medicines 
     WHERE shop_id = $1 AND batch_no = $2 AND hsn_code = $3 
     LIMIT 1`,
    [shopId, batchNo.trim(), hsnCode.trim()]
  );

  if (existing.rows.length > 0) {
    throw AppError.conflict(
      "Medicine with this Batch Number and HSN Code already exists in your inventory"
    );
  }

  const res = await client.query<Medicine>(
    `INSERT INTO medicines (
      shop_id, description, batch_no, mrp, rate, 
      gst_rate, exp_date, quantity, hsn_code, pack_size
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      shopId,
      description.trim(),
      batchNo.trim(),
      mrp,
      rate,
      gstRate,
      expDate,
      quantity,
      hsnCode.trim(),
      packSize.trim(),
    ]
  );

  return res.rows[0];
}