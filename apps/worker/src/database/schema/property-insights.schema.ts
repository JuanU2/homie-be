import { jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';
import { worker } from './worker';

export const propertyInsights = worker.table('property_insights', {
  propertyId: uuid('property_id').primaryKey(),
  insight: jsonb('insight').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
