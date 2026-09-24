import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config({ path: '../../.env' });

export default {
  dialect: 'postgresql',
  schema: ['./src/database/schema/index.ts'],
  out: './drizzle',
  extensionsFilters: ['postgis'],
  migrations: {
    table: '__drizzle_migrations_worker',
  },
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
