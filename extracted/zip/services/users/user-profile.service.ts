import { pool, type DbExecutor } from "@/lib/db/client";
import type { UserProfileResponse } from "@/types";

export async function getUserProfileById(
  userId: string,
  executor: DbExecutor = pool
): Promise<UserProfileResponse | null> {
  if (!userId) {
    return null;
  }

  const queryText = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.mob_no,
      u.role,
      u.status,
      u.is_profile_complete,
      u.created_at,
      u.updated_at,
      CASE 
        WHEN a.id IS NOT NULL THEN json_build_object(
          'id', a.id,
          'pincode', a.pincode,
          'state', a.state,
          'country', a.country,
          'district', a.district,
          'area', a.area,
          'created_at', a.created_at,
          'updated_at', a.updated_at
        )
        ELSE NULL
      END AS address
    FROM users u
    LEFT JOIN addresses a ON u.address_id = a.id
    WHERE u.id = $1
    LIMIT 1
  `;

  const result = await executor.query<UserProfileResponse>(queryText, [userId]);
  return result.rows[0] ?? null;
}