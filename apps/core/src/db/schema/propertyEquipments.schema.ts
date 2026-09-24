import { relations } from 'drizzle-orm/relations';
import { integer, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { equipmentTypes } from './equipment.schema';
import { properties } from './properties.schema';

export const propertyEquipment = core.table(
  'property_equipment',
  {
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    equipmentTypeId: uuid('equipment_type_id')
      .references(() => equipmentTypes.id, { onDelete: 'cascade' })
      .notNull(),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.equipmentTypeId] }),
  ],
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
