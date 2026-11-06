import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { env } from "@/config/env";

export type DbExecutor = Pool | PoolClient;

const globalForPg = globalThis as unknown as {
  pool: Pool | undefined;
};

/**
 * Singleton PostgreSQL connection pool.
 */
export const pool: Pool =
  globalForPg.pool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.isProduction ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (!env.isProduction) {
  globalForPg.pool = pool;
}

/**
 * Type guard to distinguish a Pool instance from a checked-out PoolClient.
 */
export function isPool(executor: DbExecutor): executor is Pool {
  return "totalCount" in executor;
}

/**
 * Executes a parameterized SQL query against the connection pool.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (env.isDevelopment) {
    console.debug(`[DB Query] (${duration}ms, rows: ${result.rowCount}):`, text.trim());
  }

  return result;
}

/**
 * Executes a callback inside an atomic SQL transaction (BEGIN -> COMMIT / ROLLBACK).
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  dbPool: Pool = pool
): Promise<T> {
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}