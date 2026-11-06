import { findShopsByQueryService } from "@/services/shops";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";
import type { ShopResponse } from "@/types";


export const GET = withApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const shopName = url.searchParams.get("shopName") || undefined;
  const gstin = url.searchParams.get("gstin") || undefined;

  if (!shopName && !gstin) {
    throw AppError.badRequest("At least one search parameter ('shopName' or 'gstin') is required.");
  }

  const shops = await findShopsByQueryService({ shopName, gstin });

  return sendSuccess<{ shops: ShopResponse[] }>({ shops });
});