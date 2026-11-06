import { pool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";
import { PAGINATION_DEFAULTS } from "@/config/constants";
import type {
  InvoiceFullResponse,
  InvoiceItem,
  InvoiceListQueryParams,
  InvoiceListResponse,
  InvoiceSummary,
} from "@/types";

export async function getInvoicesService(
  params: InvoiceListQueryParams,
  executor: DbExecutor = pool
): Promise<InvoiceListResponse> {
  const {
    shopId,
    search = "",
    page = PAGINATION_DEFAULTS.PAGE,
    limit = PAGINATION_DEFAULTS.LIMIT,
  } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.MAX_LIMIT);
  const offset = (safePage - 1) * safeLimit;

  let baseQuery = `
    SELECT 
      i.id,
      i.shop_id,
      i.buyer_id,
      i.invoice_no,
      i.invoice_date,
      i.sub_total,
      i.discount,
      i.cgst_total,
      i.sgst_total,
      i.net_amount,
      i.payment_mode,
      i.payment_status,
      i.doctor_name,
      i.created_at,
      b.name AS buyer_name,
      b.phone AS buyer_phone,
      b.gstin AS buyer_gstin,
      COUNT(it.id)::int AS item_count
    FROM invoices i
    JOIN buyers b ON i.buyer_id = b.id
    LEFT JOIN invoice_items it ON i.id = it.invoice_id
    WHERE i.shop_id = $1
  `;

  const values: unknown[] = [shopId];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchParamIdx = values.length;
    baseQuery += ` AND (i.invoice_no ILIKE $${searchParamIdx} OR b.name ILIKE $${searchParamIdx} OR b.phone ILIKE $${searchParamIdx})`;
  }

  baseQuery += ` GROUP BY i.id, b.name, b.phone, b.gstin`;

  const countQuery = `SELECT COUNT(*)::int AS count FROM (${baseQuery}) AS total_invoices`;
  const countRes = await executor.query<{ count: number }>(countQuery, values);
  const total = countRes.rows[0]?.count ?? 0;

  values.push(safeLimit, offset);
  const limitIdx = values.length - 1;
  const offsetIdx = values.length;

  const paginatedQuery = `${baseQuery} ORDER BY i.invoice_date DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const res = await executor.query<InvoiceSummary>(paginatedQuery, values);

  return {
    invoices: res.rows,
    total,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getInvoiceDetailsByIdService(
  invoiceId: string,
  shopId: string,
  executor: DbExecutor = pool
): Promise<InvoiceFullResponse> {
  const invoiceRes = await executor.query<Omit<InvoiceFullResponse, "items">>(
    `SELECT 
      i.*,
      json_build_object(
        'name', b.name,
        'phone', b.phone,
        'email', b.email,
        'gstin', b.gstin
      ) AS buyer
    FROM invoices i
    JOIN buyers b ON i.buyer_id = b.id
    WHERE i.id = $1 AND i.shop_id = $2
    LIMIT 1`,
    [invoiceId, shopId]
  );

  if (invoiceRes.rows.length === 0) {
    throw AppError.notFound("Invoice");
  }

  const itemsRes = await executor.query<InvoiceItem>(
    `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC`,
    [invoiceId]
  );

  return {
    ...invoiceRes.rows[0],
    items: itemsRes.rows,
  };
}