import type { PoolClient } from "pg";
import type { BuyerInput } from "@/types";

export async function generateInvoiceNumber(
  shopId: string,
  client: PoolClient
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  const countRes = await client.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM invoices WHERE shop_id = $1 AND invoice_no LIKE $2`,
    [shopId, `${prefix}%`]
  );

  const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

export async function findOrCreateBuyer(
  buyer: BuyerInput,
  client: PoolClient
): Promise<string> {
  const normalizedPhone = buyer.phone.trim();

  const existing = await client.query<{ id: string }>(
    `SELECT id FROM buyers WHERE phone = $1 LIMIT 1`,
    [normalizedPhone]
  );

  if (existing.rows.length > 0) {
    const buyerId = existing.rows[0].id;
    await client.query(
      `UPDATE buyers 
       SET name = $1, 
           gstin = COALESCE($2, gstin), 
           drug_licence_number = COALESCE($3, drug_licence_number),
           email = COALESCE($4, email),
           updated_at = NOW()
       WHERE id = $5`,
      [
        buyer.name.trim(),
        buyer.gstin ? buyer.gstin.trim() : null,
        buyer.drugLicenceNumber ? buyer.drugLicenceNumber.trim() : null,
        buyer.email ? buyer.email.toLowerCase().trim() : null,
        buyerId,
      ]
    );
    return buyerId;
  }

  const res = await client.query<{ id: string }>(
    `INSERT INTO buyers (name, phone, email, gstin, drug_licence_number, is_b2b)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      buyer.name.trim(),
      normalizedPhone,
      buyer.email ? buyer.email.toLowerCase().trim() : null,
      buyer.gstin ? buyer.gstin.trim() : null,
      buyer.drugLicenceNumber ? buyer.drugLicenceNumber.trim() : null,
      Boolean(buyer.isB2b || buyer.gstin),
    ]
  );

  return res.rows[0].id;
}