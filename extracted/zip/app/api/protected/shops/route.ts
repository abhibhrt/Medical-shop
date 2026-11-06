import {
  getShopByOwnerService,
  createShopService,
  updateShopService,
  deleteShopService,
} from "@/services/shops";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";
import type { ShopResponse } from "@/types";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    throw AppError.unauthorized("Authentication context missing");
  }
  return userId;
}

export const GET = withApiHandler(async (req: Request) => {
  const ownerId = getAuthenticatedUserId(req);
  const shop = await getShopByOwnerService(ownerId);

  if (!shop) {
    throw AppError.notFound("Shop");
  }

  return sendSuccess<{ shop: ShopResponse }>({ shop });
});

export const POST = withApiHandler(async (req: Request) => {
  const ownerId = getAuthenticatedUserId(req);
  const body = await req.json().catch(() => ({}));

  const {
    shopName,
    phone,
    email,
    drugLicenceNumber,
    pharmacistName,
    pharmacistRegistrationNumber,
    gstin,
    address,
    imageId,
  } = body;

  if (
    !shopName ||
    !phone ||
    !email ||
    !drugLicenceNumber ||
    !pharmacistName ||
    !pharmacistRegistrationNumber ||
    !gstin ||
    !address
  ) {
    throw new AppError("All shop details and address fields are required.", 400, "VALIDATION_ERROR");
  }

  const newShop = await createShopService({
    ownerId,
    shopName,
    phone,
    email,
    drugLicenceNumber,
    pharmacistName,
    pharmacistRegistrationNumber,
    gstin,
    address,
    imageId,
  });

  return sendSuccess<{ shop: ShopResponse }>({ shop: newShop }, "Shop created successfully", 201);
});

export const PATCH = withApiHandler(async (req: Request) => {
  const ownerId = getAuthenticatedUserId(req);
  const body = await req.json().catch(() => ({}));

  const updatedShop = await updateShopService({
    ownerId,
    ...body,
  });

  return sendSuccess<{ shop: ShopResponse }>({ shop: updatedShop }, "Shop updated successfully");
});

export const DELETE = withApiHandler(async (req: Request) => {
  const ownerId = getAuthenticatedUserId(req);
  const result = await deleteShopService(ownerId);

  return sendSuccess<{ message: string }>(result, "Shop deleted successfully");
});