import { timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { listings } from './listings.schema';
import { users } from './users.schema';

export const favourites = core.table(
  'favourites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listingId: uuid('listing_id')
      .references(() => listings.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('favourites_user_listing_unique').on(
      table.userId,
      table.listingId,
    ),
  ],
);
