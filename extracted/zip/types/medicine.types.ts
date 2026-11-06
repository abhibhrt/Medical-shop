import type { BaseEntity, PaginationParams } from "./common.types";

/**
 * Core Medicine (Inventory) database entity.
 */
export interface Medicine extends BaseEntity {
  shop_id: string;
  description: string;
  batch_no: string;
  mrp: string;
  rate: string;
  gst_rate: string;
  exp_date: string;
  quantity: number;
  hsn_code: string;
  pack_size: string;
}

/**
 * Input payload for adding a new medicine to inventory.
 */
export interface CreateMedicineInput {
  shopId: string;
  description: string;
  batchNo: string;
  mrp: string;
  rate: string;
  gstRate: string;
  expDate: string;
  quantity: number;
  hsnCode: string;
  packSize: string;
}

/**
 * Input payload for updating an existing medicine.
 */
export interface UpdateMedicineInput extends Partial<Omit<CreateMedicineInput, "shopId">> {
  id: string;
  shopId: string;
}

/**
 * Query parameters for filtering and paginating shop inventory.
 */
export interface MedicineQueryParams extends PaginationParams {
  shopId: string;
}

/**
 * Paginated response structure for medicine queries.
 */
export interface MedicineListResponse {
  medicines: Medicine[];
  total: number;
  page: number;
  limit: number;
}


export interface MedicineItem {
  id: string;
  shop_id: string;
  description: string;
  batch_no: string;
  mrp: string;
  rate: string;
  gst_rate: string;
  exp_date: string;
  quantity: number;
  hsn_code: string;
  pack_size: string;
}