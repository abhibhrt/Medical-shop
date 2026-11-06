import { findUserByCriteria } from "@/services/users";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";
import type { UserWithPassword } from "@/types";

export const GET = withApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const mobNo = url.searchParams.get("mobNo") || url.searchParams.get("mobile");

  if (!email && !mobNo) {
    throw AppError.badRequest("Please provide either an email or mobile number to search.");
  }

  const user = await findUserByCriteria({
    email: email ?? undefined,
    mobNo: mobNo ?? undefined,
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  return sendSuccess<{ user: UserWithPassword }>({ user });
});