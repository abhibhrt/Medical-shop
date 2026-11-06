import { NextResponse } from "next/server";
import { findUserByCriteria } from "@/services/users";
import { verifyPassword } from "@/lib/auth/password.util";
import { signToken } from "@/lib/auth/jwt.util";
import { setAuthCookieOnResponse } from "@/lib/auth/cookies.util";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const { email, mobNo, password } = body;

  if ((!email && !mobNo) || !password) {
    throw new AppError("Email or mobile number, and password are required", 400, "VALIDATION_ERROR");
  }

  const existing = await findUserByCriteria({ email, mobNo });

  if (!existing || !existing.password) {
    throw new AppError("Invalid email, mobile number, or password", 401, "UNAUTHORIZED");
  }

  const isPasswordValid = await verifyPassword(password, existing.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email, mobile number, or password", 401, "UNAUTHORIZED");
  }

  const token = await signToken({
    userId: existing.id,
    email: existing.email,
    role: existing.role,
  });

  const { password: _, ...userSafe } = existing;

  const response = sendSuccess(
    { user: userSafe },
    "Signin successful"
  );

  return setAuthCookieOnResponse(response, token);
});