import { getUserProfileById, updateUserService } from "@/services/users";
import { withApiHandler, sendSuccess } from "@/lib/api/api-handler";
import { AppError } from "@/lib/api/app-error";
import type { UpdateUserInput, UserProfileResponse } from "@/types";

export const GET = withApiHandler(async (req: Request) => {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    throw AppError.unauthorized("Authentication context missing");
  }

  const userProfile = await getUserProfileById(userId);

  if (!userProfile) {
    throw AppError.notFound("User profile");
  }

  return sendSuccess<{ user: UserProfileResponse }>({ user: userProfile });
});

export const PUT = withApiHandler(async (req: Request) => {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    throw AppError.unauthorized("Authentication context missing");
  }

  const body = await req.json().catch(() => ({}));
  const { email: _disallowedEmail, ...updateData }: UpdateUserInput & { email?: string } = body;

  await updateUserService(userId, updateData);
  const updatedProfile = await getUserProfileById(userId);

  if (!updatedProfile) {
    throw AppError.notFound("User profile");
  }

  return sendSuccess<{ user: UserProfileResponse }>(
    { user: updatedProfile },
    "User profile updated successfully"
  );
});