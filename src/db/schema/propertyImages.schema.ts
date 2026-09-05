import { boolean, customType, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { properties } from './properties.schema';

export const propertyImages = pgTable("property_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  title: boolean("title").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});