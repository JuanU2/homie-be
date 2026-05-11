import { date, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { properties } from '@/db/schema/properties.schema';
import { users } from '@/db/schema/users.schema';
import { pgEnum } from 'drizzle-orm/pg-core/columns/enum';

export const currencyEnum = pgEnum("currency_enum", ["EUR", "CZK", "USD"]);

export const roommateRequestStatusEnum = pgEnum(
  "roommate_request_status_enum",
  ["ACTIVE", "RESERVED", "CLOSED", "EXPIRED"],
);

export const roommateRequests = pgTable("roommate_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  priceAmount: integer("price_amount").notNull(),
  priceCurrency: currencyEnum("price_currency").notNull(),
  idealMoveInDate: date("ideal_move_in_date"),
  maxRoommates: integer("max_roommates").notNull(),
  currentRoommates: integer("current_roommates").notNull(),
  status: roommateRequestStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});