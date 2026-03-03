import { customType, pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
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
    phoneNumber: varchar("phone_number", { length: 20 }).unique(),
    primaryInterest: interestEnum("primary_interest"),
    idealLocation: geographyPoint("ideal_location"),
  },
);