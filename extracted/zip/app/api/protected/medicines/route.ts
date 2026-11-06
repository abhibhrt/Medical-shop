import { getShopIdByOwner, getMedicinesService, createMedicineService } from "@/services/medicines";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";
import type { Medicine, MedicineListResponse } from "@/types";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    throw AppError.unauthorized("Authentication context missing");
  }
  return userId;
}

export const GET = withApiHandler(async (req: Request) => {
  const userId = getAuthenticatedUserId(req);
  const shopId = await getShopIdByOwner(userId);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const result: MedicineListResponse = await getMedicinesService({
    shopId,
    search,
    page,
    limit,
  });

  return sendSuccess<MedicineListResponse>(result);
});

export const POST = withApiHandler(async (req: Request) => {
  const userId = getAuthenticatedUserId(req);
  const shopId = await getShopIdByOwner(userId);
  const body = await req.json().catch(() => ({}));

  const {
    description,
    batchNo,
    mrp,
    rate,
    gstRate,
    expDate,
    quantity,
    hsnCode,
    packSize,
  } = body;

  if (
    !description ||
    !batchNo ||
    mrp === undefined ||
    rate === undefined ||
    gstRate === undefined ||
    !expDate ||
    quantity === undefined ||
    !hsnCode ||
    !packSize
  ) {
    throw new AppError("All medicine fields are required.", 400, "VALIDATION_ERROR");
  }

  if (Number(quantity) < 0) {
    throw new AppError("Quantity cannot be negative.", 400, "VALIDATION_ERROR");
  }

  const medicine: Medicine = await createMedicineService({
    shopId,
    description,
    batchNo,
    mrp: String(mrp),
    rate: String(rate),
    gstRate: String(gstRate),
    expDate,
    quantity: Number(quantity),
    hsnCode,
    packSize,
  });

  return sendSuccess<{ medicine: Medicine }>({ medicine }, "Medicine added successfully", 201);
});