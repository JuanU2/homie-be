import { relations } from 'drizzle-orm/relations';
import { integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { properties } from './properties.schema';

export const roomTypeEnum = core.enum('room_type_enum', [
  'DORMITORY',
  'BATHROOM',
  'KITCHEN',
  'LIVING_ROOM',
  'TOILET',
  'WARDROBE',
  'BALCONY',
  'OTHER',
]);

export const propertyRooms = core.table('property_rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .references(() => properties.id, { onDelete: 'cascade' })
    .notNull(),
  roomType: roomTypeEnum('room_type').notNull(),
  count: integer('count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const propertyRoomsRelations = relations(propertyRooms, ({ one }) => ({
  property: one(properties, {
    fields: [propertyRooms.propertyId],
    references: [properties.id],
  }),
}));
