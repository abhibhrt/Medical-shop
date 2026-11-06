// services/invoices.ts (or wherever createInvoiceService resides)
import type { PoolClient } from "pg";
import { pool, withTransaction, isPool, type DbExecutor } from "@/lib/db/client";
import { AppError } from "@/lib/api/app-error";
import { generateInvoiceNumber, findOrCreateBuyer } from "./invoice.helper";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceFullResponse,
  InvoiceItem,
  Medicine,
} from "@/types";

interface ProcessedInvoiceItem {
  medicineId: string;
  description: string;
  batchNo: string;
  expDate: string;
  hsnCode: string;
  packSize: string;
  quantity: number;
  freeQuantity: number;
  mrp: string;
  rate: string;
  gstRate: string;
  taxableAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  totalAmount: string;
}

// Extend your CreateInvoiceInput type or interface to optionally include buyerShopId
export interface ExtendedCreateInvoiceInput extends CreateInvoiceInput {
  buyerShopId?: string | null;
}

export async function createInvoiceService(
  input: ExtendedCreateInvoiceInput,
  executor: DbExecutor = pool
): Promise<InvoiceFullResponse> {
  if (isPool(executor)) {
    return withTransaction((client) => executeCreateInvoice(input, client), executor);
  }
  return executeCreateInvoice(input, executor);
}

async function executeCreateInvoice(
  input: ExtendedCreateInvoiceInput,
  client: PoolClient
): Promise<InvoiceFullResponse> {
  const {
    shopId,
    buyerShopId,
    buyer,
    items,
    discount = 0,
    paymentMode,
    paymentStatus,
    doctorName,
    doctorRegNo,
    note,
  } = input;

  if (!items || items.length === 0) {
    throw new AppError("Invoice must contain at least one item", 400, "VALIDATION_ERROR");
  }

  const buyerId = await findOrCreateBuyer(buyer, client);

  let subTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  const processedItems: ProcessedInvoiceItem[] = [];

  for (const item of items) {
    const freeQty = item.freeQuantity ?? 0;
    const totalDeductQty = item.quantity + freeQty;

    // 1. Fetch medicine from seller's shop
    const medRes = await client.query<Medicine>(
      `SELECT * FROM medicines WHERE id = $1 AND shop_id = $2 FOR UPDATE`,
      [item.medicineId, shopId]
    );

    if (medRes.rows.length === 0) {
      throw AppError.notFound(`Medicine (${item.medicineId})`);
    }

    const med = medRes.rows[0];

    if (med.quantity < totalDeductQty) {
      throw new AppError(
        `Insufficient stock for "${med.description}". In stock: ${med.quantity}, requested: ${totalDeductQty}`,
        400,
        "INSUFFICIENT_STOCK"
      );
    }

    const rate = parseFloat(med.rate);
    const gstRate = parseFloat(med.gst_rate);
    const taxableAmount = +(rate * item.quantity).toFixed(2);

    const halfGst = gstRate / 2;
    const cgstAmount = +((taxableAmount * halfGst) / 100).toFixed(2);
    const sgstAmount = +((taxableAmount * halfGst) / 100).toFixed(2);
    const totalAmount = +(taxableAmount + cgstAmount + sgstAmount).toFixed(2);

    subTotal += taxableAmount;
    cgstTotal += cgstAmount;
    sgstTotal += sgstAmount;

    // 2. Deduct stock from Seller Shop
    await client.query(
      `UPDATE medicines 
       SET quantity = quantity - $1, updated_at = NOW() 
       WHERE id = $2`,
      [totalDeductQty, med.id]
    );

    // 3. If B2B and buyerShopId is provided, add/transfer stock to Buyer's Shop inventory
    if (buyerShopId) {
      const totalReceivedQty = item.quantity + freeQty;

      // Check if the same medicine (by batch_no and hsn_code or description) exists in buyer's shop inventory
      const buyerMedRes = await client.query<Medicine>(
        `SELECT id, quantity FROM medicines 
         WHERE shop_id = $1 AND batch_no = $2 AND hsn_code = $3 LIMIT 1`,
        [buyerShopId, med.batch_no, med.hsn_code]
      );

      if (buyerMedRes.rows.length > 0) {
        // Update existing batch quantity in buyer's shop
        await client.query(
          `UPDATE medicines 
           SET quantity = quantity + $1, updated_at = NOW() 
           WHERE id = $2`,
          [totalReceivedQty, buyerMedRes.rows[0].id]
        );
      } else {
        // Insert new medicine record into buyer's shop inventory
        await client.query(
          `INSERT INTO medicines (
            shop_id, description, batch_no, mrp, rate, 
            gst_rate, exp_date, quantity, hsn_code, pack_size
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            buyerShopId,
            med.description,
            med.batch_no,
            med.mrp,
            med.rate,
            med.gst_rate,
            med.exp_date,
            totalReceivedQty,
            med.hsn_code,
            med.pack_size,
          ]
        );
      }
    }

    processedItems.push({
      medicineId: med.id,
      description: med.description,
      batchNo: med.batch_no,
      expDate: med.exp_date,
      hsnCode: med.hsn_code,
      packSize: med.pack_size,
      quantity: item.quantity,
      freeQuantity: freeQty,
      mrp: med.mrp,
      rate: med.rate,
      gstRate: med.gst_rate,
      taxableAmount: taxableAmount.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    });
  }

  const totalTax = cgstTotal + sgstTotal;
  const netAmount = Math.max(0, +(subTotal + totalTax - discount).toFixed(2));
  const invoiceNo = await generateInvoiceNumber(shopId, client);

  const invoiceRes = await client.query<Invoice>(
    `INSERT INTO invoices (
      shop_id, buyer_id, invoice_no, sub_total, discount, 
      cgst_total, sgst_total, net_amount, payment_mode, 
      payment_status, doctor_name, doctor_reg_no, note
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      shopId,
      buyerId,
      invoiceNo,
      subTotal.toFixed(2),
      discount.toFixed(2),
      cgstTotal.toFixed(2),
      sgstTotal.toFixed(2),
      netAmount.toFixed(2),
      paymentMode,
      paymentStatus,
      doctorName?.trim() || null,
      doctorRegNo?.trim() || null,
      note?.trim() || null,
    ]
  );

  const invoice = invoiceRes.rows[0];

  const createdItems: InvoiceItem[] = [];
  for (const item of processedItems) {
    const itemRes = await client.query<InvoiceItem>(
      `INSERT INTO invoice_items (
        invoice_id, medicine_id, description, batch_no, exp_date,
        hsn_code, pack_size, quantity, free_quantity, mrp, rate,
        gst_rate, taxable_amount, cgst_amount, sgst_amount, total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        invoice.id,
        item.medicineId,
        item.description,
        item.batchNo,
        item.expDate,
        item.hsnCode,
        item.packSize,
        item.quantity,
        item.freeQuantity,
        item.mrp,
        item.rate,
        item.gstRate,
        item.taxableAmount,
        item.cgstAmount,
        item.sgstAmount,
        item.totalAmount,
      ]
    );
    createdItems.push(itemRes.rows[0]);
  }

  return {
    ...invoice,
    items: createdItems,
    buyer: {
      name: buyer.name.trim(),
      phone: buyer.phone.trim(),
      email: buyer.email?.toLowerCase().trim() || null,
      gstin: buyer.gstin?.trim() || null,
    },
  };
}