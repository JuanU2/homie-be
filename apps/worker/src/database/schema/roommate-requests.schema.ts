import { index, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';
import { worker } from './worker';

export const roommateRequests = worker.table(
  'roommate_requests',
  {
    roommateRequestId: uuid('roommate_request_id').primaryKey(),
    propertyId: uuid('property_id').notNull(),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('roommate_requests_property_id_idx').on(table.propertyId)],
);
