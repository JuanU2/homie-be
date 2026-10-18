import { timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { roommateRequests } from './roommateRequests.schema';
import { users } from './users.schema';

export const favourites = core.table(
  'favourites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roommateRequestId: uuid('roommate_request_id')
      .references(() => roommateRequests.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('favourites_user_roommate_request_unique').on(
      table.userId,
      table.roommateRequestId,
    ),
  ],
);
