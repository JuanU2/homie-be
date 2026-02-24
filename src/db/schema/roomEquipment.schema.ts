import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { rooms } from '@/db/schema/rooms.schema';
import { equipmentTypes } from './equipment.schema';

export const roomEquipment = pgTable(
  "room_equipment",
  {
    roomId: uuid("room_id")
      .references(() => rooms.id, { onDelete: "cascade" })
      .notNull(),

    equipmentTypeId: uuid("equipment_type_id")
      .references(() => equipmentTypes.id, { onDelete: "cascade" })
      .notNull(),

    quantity: integer("quantity").notNull(),
  },
  (table) => [{ 
    pk: primaryKey({
      columns: [table.roomId, table.equipmentTypeId],
    }),
  }],
);