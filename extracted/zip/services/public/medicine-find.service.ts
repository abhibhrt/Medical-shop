// services/public/medicines-find.service.ts

import { pool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";
import { PAGINATION_DEFAULTS } from "@/config/constants";
import type { Medicine, MedicineListResponse, MedicineQueryParams } from "@/types";

export interface PublicMedicineQueryParams extends MedicineQueryParams {
  city?: string;
  pincode?: string;
}

export async function getPublicMedicinesService(
  params: PublicMedicineQueryParams,
  executor: DbExecutor = pool
): Promise<MedicineListResponse> {
  const {
    shopId = "",
    search = "",
    city = "",
    pincode = "",
    page = PAGINATION_DEFAULTS.PAGE,
    limit = PAGINATION_DEFAULTS.LIMIT,
  } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.MAX_LIMIT);
  const offset = (safePage - 1) * safeLimit;

  let baseQuery = `
    SELECT 
      m.id, 
      m.shop_id, 
      m.description, 
      m.batch_no, 
      m.mrp, 
      m.rate, 
      m.gst_rate, 
      m.exp_date, 
      m.quantity, 
      m.hsn_code, 
      m.pack_size, 
      m.created_at, 
      m.updated_at,
      s.shop_name AS shop_name,
      CONCAT(a.area, ', ', a.district, ' - ', a.pincode) AS shop_address
    FROM medicines m
    JOIN shops s ON m.shop_id = s.id
    JOIN addresses a ON s.address_id = a.id
    WHERE 1=1
  `;
  const values: unknown[] = [];

  if (shopId.trim()) {
    values.push(shopId.trim());
    baseQuery += ` AND m.shop_id = $${values.length}`;
  }

  if (city.trim()) {
    values.push(`%${city.trim()}%`);
    const cityIdx = values.length;
    baseQuery += ` AND (a.district ILIKE $${cityIdx} OR a.area ILIKE $${cityIdx})`;
  }

  if (pincode.trim()) {
    values.push(pincode.trim());
    baseQuery += ` AND a.pincode = $${values.length}`;
  }

  if (search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchIdx = values.length;
    baseQuery += ` AND (m.description ILIKE $${searchIdx} OR m.batch_no ILIKE $${searchIdx} OR m.hsn_code ILIKE $${searchIdx})`;
  }

  const countQuery = `SELECT COUNT(*)::int AS count FROM (${baseQuery}) AS total_count`;
  const countRes = await executor.query<{ count: number }>(countQuery, values);
  const total = countRes.rows[0]?.count ?? 0;

  values.push(safeLimit, offset);
  const limitIdx = values.length - 1;
  const offsetIdx = values.length;

  const paginatedQuery = `${baseQuery} ORDER BY m.created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const res = await executor.query<Medicine>(paginatedQuery, values);

  return {
    medicines: res.rows,
    total,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getPublicMedicineByIdService(
  id: string,
  executor: DbExecutor = pool
): Promise<Medicine> {
  const res = await executor.query<Medicine>(
    `
      SELECT 
        m.*,
        s.shop_name AS shop_name,
        CONCAT(a.area, ', ', a.district, ' - ', a.pincode) AS shop_address
      FROM medicines m
      JOIN shops s ON m.shop_id = s.id
      JOIN addresses a ON s.address_id = a.id
      WHERE m.id = $1 
      LIMIT 1
    `,
    [id]
  );

  if (res.rows.length === 0) {
    throw AppError.notFound("Medicine");
  }

  return res.rows[0];
}