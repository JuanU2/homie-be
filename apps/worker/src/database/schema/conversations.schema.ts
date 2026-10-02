import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { worker } from './worker';

export const conversations = worker.table(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roommateRequestId: uuid('roommate_request_id').notNull(),
    sub: varchar('sub', { length: 255 }).notNull(),
    status: varchar('status', { length: 32 }).notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('conversations_sub_roommate_request_idx').on(
      table.sub,
      table.roommateRequestId,
    ),
    uniqueIndex('conversations_one_active_per_user_request')
      .on(table.sub, table.roommateRequestId)
      .where(sql`${table.status} = 'ACTIVE'`),
  ],
);

export const messages = worker.table(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    content: jsonb('content').notNull(),
    role: varchar('role', { length: 32 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('messages_conversation_id_idx').on(table.conversationId)],
);
