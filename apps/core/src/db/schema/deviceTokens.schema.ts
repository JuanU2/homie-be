import { text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { users } from './users.schema';

export const deviceTokens = core.table(
  'device_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('device_tokens_token_unique').on(table.token)],
);
