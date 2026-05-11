import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { equipmentTypes } from './equipment.schema';
import { properties } from './properties.schema';
import { relations } from 'drizzle-orm/relations';

export const propertyEquipment = pgTable(
  "property_equipment",
  {
    propertyId: uuid("property_id")
      .references(() => properties.id, { onDelete: "cascade" })
      .notNull(),

    equipmentTypeId: uuid("equipment_type_id")
      .references(() => equipmentTypes.id, { onDelete: "cascade" })
      .notNull(),

    quantity: integer("quantity").notNull(),
  },
  (table) => [{ 
    pk: primaryKey({
      columns: [table.propertyId, table.equipmentTypeId],
    }),
  }],
);

export const propertyEquipmentRelations = relations(propertyEquipment, ({ one }) => ({
  property: one(properties, {
    fields: [propertyEquipment.propertyId],
    references: [properties.id],
  }),
  equipmentType: one(equipmentTypes, {
    fields: [propertyEquipment.equipmentTypeId],
    references: [equipmentTypes.id],
  }),
}));