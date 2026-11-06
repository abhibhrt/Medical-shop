import { getPublicMedicinesService } from "@/services/public/medicine-find.service";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import type { MedicineListResponse } from "@/types";

export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const pincode = searchParams.get("pincode") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const result: MedicineListResponse = await getPublicMedicinesService({
    shopId: "",
    search,
    city,
    pincode,
    page,
    limit,
  });

  return sendSuccess<MedicineListResponse>(result);
});