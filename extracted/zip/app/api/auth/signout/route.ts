import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { removeAuthCookieFromResponse } from "@/lib/auth/cookies.util";

export const POST = withApiHandler(async () => {
  const response = sendSuccess<{ message: string }>({ message: "Signed out successfully" });
  removeAuthCookieFromResponse(response);
  return response;
});