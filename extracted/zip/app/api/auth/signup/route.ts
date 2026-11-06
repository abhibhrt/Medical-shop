import { createUserService } from "@/services/users";
import { signToken } from "@/lib/auth/jwt.util";
import { setAuthCookieOnResponse } from "@/lib/auth/cookies.util";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const { name, email, mobNo, password, role, address } = body;

  if (!name || !email || !mobNo || !password) {
    throw new AppError("Name, email, mobile number, and password are required", 400, "VALIDATION_ERROR");
  }

  const newUser = await createUserService({
    name,
    email,
    mobNo,
    password,
    role,
    address,
  });

  const token = await signToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  const response = sendSuccess(
    { user: newUser },
    "Registration successful",
    201
  );

  return setAuthCookieOnResponse(response, token);
});