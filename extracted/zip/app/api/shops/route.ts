import {
  getShopByOwnerService
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
