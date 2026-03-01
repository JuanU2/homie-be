import { customType, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from '@/db/schema/users.schema';

const geographyPoint = customType<{
  data: string; // budeme posielať WKT alebo ST_Point SQL
}>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),

  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  description: text("description").notNull(),

  sizeM2: integer("size_m2"),

  roomCount: integer("room_count").notNull(),

  country: varchar("country", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  zipCode: varchar("zip_code", { length: 50 }).notNull(),

  street: varchar("street", { length: 255 }).notNull(),
  streetNumber: varchar("street_number", { length: 50 }).notNull(),

  location: geographyPoint("location").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});