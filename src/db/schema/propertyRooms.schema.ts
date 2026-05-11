import { integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { properties } from '@/db/schema/properties.schema';
import { pgEnum } from 'drizzle-orm/pg-core/columns/enum';
import { relations } from 'drizzle-orm/relations';

export const roomTypeEnum = pgEnum("room_type_enum", [
  "DORMITORY",
  "BATHROOM",
  "KITCHEN",
  "LIVING_ROOM",
  "TOILET",
  "WARDROBE",
  "BALCONY",
  "OTHER"
]);

export const propertyRooms = pgTable("property_rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  roomType: roomTypeEnum("room_type").notNull(),
  count: integer("count").notNull(),
});


export const propertyRoomsRelations = relations(propertyRooms, ({ one }) => ({
  property: one(properties, {
    fields: [propertyRooms.propertyId],
    references: [properties.id],
  }),
}));
