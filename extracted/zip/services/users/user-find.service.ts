import { pool, type DbExecutor } from "@/lib/db/client";
import type { UserWithPassword } from "@/types";

export interface FindUserCriteria {
  id?: string;
  email?: string;
  mobNo?: string;
}

export async function findUserByCriteria(
  criteria: FindUserCriteria,
  executor: DbExecutor = pool
): Promise<UserWithPassword | null> {
  const clauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (criteria.id) {
    clauses.push(`id = $${paramIndex++}`);
    values.push(criteria.id);
  }

  if (criteria.email) {
    clauses.push(`email = $${paramIndex++}`);
    values.push(criteria.email.toLowerCase().trim());
  }

  if (criteria.mobNo) {
    clauses.push(`mob_no = $${paramIndex++}`);
    values.push(criteria.mobNo.trim());
  }

  if (clauses.length === 0) {
    return null;
  }

  const queryText = `
    SELECT id, name, email, mob_no, password, role, status, is_profile_complete, address_id, created_at, updated_at
    FROM users
    WHERE ${clauses.join(" OR ")}
    LIMIT 1
  `;

  const result = await executor.query<UserWithPassword>(queryText, values);
  return result.rows[0] ?? null;
}