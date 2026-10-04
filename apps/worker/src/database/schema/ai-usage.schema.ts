import { date, integer, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { worker } from './worker';

export const aiUsage = worker.table(
  'ai_usage',
  {
    sub: varchar('sub', { length: 255 }).notNull(),
    feature: varchar('feature', { length: 32 }).notNull(),
    day: date('day').notNull(),
    count: integer('count').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.sub, table.feature, table.day] })],
);
