import { index, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';
import { worker } from './worker';

export const listings = worker.table(
  'listings',
  {
    listingId: uuid('listing_id').primaryKey(),
    propertyId: uuid('property_id').notNull(),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('listings_property_id_idx').on(table.propertyId)],
);
