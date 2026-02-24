import { pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const equipmentTypes = pgTable(
  "equipment_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
  },
  (table) => [{
    nameUnique: uniqueIndex("equipment_types_name_unique").on(table.name),
  }],
);