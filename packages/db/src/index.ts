import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

export type { NodePgDatabase };

export function createDb<TSchema extends Record<string, unknown>>(
  pool: Pool,
  schema: TSchema,
): NodePgDatabase<TSchema> {
  return drizzle(pool, { schema });
}
