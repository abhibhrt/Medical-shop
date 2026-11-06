import type { BaseEntity, PaginationParams } from "./common.types";

export type PaymentMode = "CASH" | "UPI" | "CARD" | "NET_BANKING" | "CREDIT";
export type PaymentStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID";


export interface InvoiceSummary extends Omit<Invoice, "updated_at" | "doctor_reg_no" | "note" | "items"> {
  buyer_name: string;
  buyer_phone: string;
  buyer_gstin: string | null;
  item_count: number;
}

export interface InvoiceListQueryParams extends PaginationParams {
  shopId: string;
}

export interface InvoiceListResponse {
  invoices: InvoiceSummary[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Core Buyer (Customer) database entity.
 */
export interface Buyer extends BaseEntity {
  name: string;
  phone: string;
  email: string | null;
  gstin: string | null;
  drug_licence_number: string | null;
  is_b2b: boolean;
  user_id: string | null;
  address_id: string | null;
}

/**
 * Individual line item within an Invoice.
 */
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  medicine_id: string | null;
  description: string;
  batch_no: string;
  exp_date: string;
  hsn_code: string;
  pack_size: string;
  quantity: number;
  free_quantity: number;
  mrp: string;
  rate: string;
  gst_rate: string;
  taxable_amount: string;
  cgst_amount: string;
  sgst_amount: string;
  total_amount: string;
  created_at: string;
}

/**
 * Core Invoice header database entity.
 */
export interface Invoice extends BaseEntity {
  shop_id: string;
  buyer_id: string;
  invoice_no: string;
  invoice_date: string;
  sub_total: string;
  discount: string;
  cgst_total: string;
  sgst_total: string;
  net_amount: string;
  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
  doctor_name: string | null;
  doctor_reg_no: string | null;
  note: string | null;
  items?: InvoiceItem[];
}

/**
 * Buyer details input when generating an invoice.
 */
export interface BuyerInput {
  name: string;
  phone: string;
  email?: string | null;
  gstin?: string | null;
  drugLicenceNumber?: string | null;
  isB2b?: boolean;
}

/**
 * Line item input when generating an invoice.
 */
export interface CreateInvoiceItemInput {
  medicineId: string;
  quantity: number;
  freeQuantity?: number;
  discountPercent?: number;
}

/**
 * Complete payload for generating a new invoice.
 */
export interface CreateInvoiceInput {
  shopId: string;
  buyer: BuyerInput;
  items: CreateInvoiceItemInput[];
  discount?: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  doctorName?: string | null;
  doctorRegNo?: string | null;
  note?: string | null;
}

/**
 * Complete Invoice details returned by GET /api/invoices/[id].
 */
export interface InvoiceFullResponse extends Invoice {
  items: InvoiceItem[];
  buyer: Pick<Buyer, "name" | "phone" | "email" | "gstin">;
}