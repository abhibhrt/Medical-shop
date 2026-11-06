import { getShopIdByOwner } from "@/services/medicines";
import { getInvoiceDetailsByIdService } from "@/services/invoices";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";
import type { InvoiceFullResponse } from "@/types";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    throw AppError.unauthorized("Authentication context missing");
  }
  return userId;
}

export const GET = withApiHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = getAuthenticatedUserId(req);
    const shopId = await getShopIdByOwner(userId);
    
    const { id } = await params;

    const invoice: InvoiceFullResponse = await getInvoiceDetailsByIdService(id, shopId);
    return sendSuccess<{ invoice: InvoiceFullResponse }>({ invoice });
  }
);