import { InferModel, relations } from 'drizzle-orm';
import { pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { userSettings } from './userSettings.schema';

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    googleSub: varchar("google_sub", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_google_sub_unique").on(table.googleSub),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  userSettings: one(userSettings),
}));