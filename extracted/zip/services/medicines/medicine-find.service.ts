import { pool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";
import { PAGINATION_DEFAULTS } from "@/config/constants";
import type { Medicine, MedicineListResponse, MedicineQueryParams } from "@/types";

export async function getShopIdByOwner(
  ownerId: string,
  executor: DbExecutor = pool
): Promise<string> {
  const res = await executor.query<{ id: string }>(
    `SELECT id FROM shops WHERE owner_id = $1 LIMIT 1`,
    [ownerId]
  );
  if (res.rows.length === 0) {
    throw AppError.notFound("Shop for this account");
  }
  return res.rows[0].id;
}

export async function getMedicinesService(
  params: MedicineQueryParams,
  executor: DbExecutor = pool
): Promise<MedicineListResponse> {
  const {
    shopId = "",
    search = "",
    page = PAGINATION_DEFAULTS.PAGE,
    limit = PAGINATION_DEFAULTS.LIMIT,
  } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.MAX_LIMIT);
  const offset = (safePage - 1) * safeLimit;

  let baseQuery = `
    SELECT 
      id, shop_id, description, batch_no, mrp, rate, gst_rate, 
      exp_date, quantity, hsn_code, pack_size, created_at, updated_at
    FROM medicines
    WHERE shop_id = $1
  `;
  const values: unknown[] = [shopId];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchIdx = values.length;
    baseQuery += ` AND (description ILIKE $${searchIdx} OR batch_no ILIKE $${searchIdx} OR hsn_code ILIKE $${searchIdx})`;
  }

  const countQuery = `SELECT COUNT(*)::int AS count FROM (${baseQuery}) AS total_count`;
  const countRes = await executor.query<{ count: number }>(countQuery, values);
  const total = countRes.rows[0]?.count ?? 0;

  values.push(safeLimit, offset);
  const limitIdx = values.length - 1;
  const offsetIdx = values.length;

  const paginatedQuery = `${baseQuery} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const res = await executor.query<Medicine>(paginatedQuery, values);

  return {
    medicines: res.rows,
    total,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getMedicineByIdService(
  id: string,
  shopId: string,
  executor: DbExecutor = pool
): Promise<Medicine> {
  const res = await executor.query<Medicine>(
    `SELECT * FROM medicines WHERE id = $1 AND shop_id = $2 LIMIT 1`,
    [id, shopId]
  );

  if (res.rows.length === 0) {
    throw AppError.notFound("Medicine");
  }

  return res.rows[0];
}