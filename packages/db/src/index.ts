export * from './schema';

import * as schema from './schema';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

export { schema };

export type Database = NodePgDatabase<typeof schema>;

export function createDb(pool: Pool): Database {
  return drizzle(pool, { schema });
}
