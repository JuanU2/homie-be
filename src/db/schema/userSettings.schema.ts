import { customType, pgEnum, pgTable, uuid } from 'drizzle-orm/pg-core';
import { users } from '@/db/schema/users.schema';

export const interestEnum = pgEnum("interest_enum", ["FIND_HOUSING", "RENT"]);

const geographyPoint = customType<{
  data: string; // budeme posielať WKT alebo ST_Point SQL
}>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

export const userSettings = pgTable(
  "user_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    primaryInterest: interestEnum("primary_interest").notNull(),
    idealLocation: geographyPoint("ideal_location"),
  },
);