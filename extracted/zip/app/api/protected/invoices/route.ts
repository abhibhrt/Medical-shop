// app/api/protected/invoices/route.ts
import { getShopIdByOwner } from "@/services/medicines";
import { getInvoicesService, createInvoiceService } from "@/services/invoices";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";
import type { InvoiceFullResponse, InvoiceListResponse } from "@/types";

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
  const limit = parseInt(searchParams.get("limit") || "15", 10);

  const data: InvoiceListResponse = await getInvoicesService({
    shopId,
    search,
    page,
    limit,
  });

  return sendSuccess<InvoiceListResponse>(data);
});

export const POST = withApiHandler(async (req: Request) => {
  const userId = getAuthenticatedUserId(req);
  const shopId = await getShopIdByOwner(userId);
  const body = await req.json().catch(() => ({}));

  const {
    buyer,
    items,
    buyerShopId: buyerShopId, // Extracted from payload if a registered B2B shop was selected
    discount = 0,
    paymentMode = "CASH",
    paymentStatus = "PAID",
    doctorName,
    doctorRegNo,
    note,
  } = body;

  if (!buyer?.name || !buyer?.phone) {
    throw new AppError("Customer name and phone number are required.", 400, "VALIDATION_ERROR");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError("At least one item must be added to the invoice.", 400, "VALIDATION_ERROR");
  }

  const invoice: InvoiceFullResponse = await createInvoiceService({
    shopId,
    buyerShopId: buyerShopId || null, // Passed to service for inventory addition
    buyer,
    items,
    discount: Number(discount) || 0,
    paymentMode,
    paymentStatus,
    doctorName,
    doctorRegNo,
    note,
  });

  return sendSuccess<{ invoice: InvoiceFullResponse }>({ invoice }, "Invoice generated successfully", 201);
});