import { timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { core } from './core';

export const equipmentTypes = core.table(
  'equipment_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('equipment_types_name_unique').on(table.name)],
);
