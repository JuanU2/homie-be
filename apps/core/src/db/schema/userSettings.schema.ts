import { relations } from 'drizzle-orm/relations';
import { customType, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { core } from './core';
import { users } from './users.schema';

export const interestEnum = core.enum('interest_enum', [
  'FIND_HOUSING',
  'RENT',
]);

const geographyPoint = customType<{
  data: string;
}>({
  dataType() {
    return 'geography(Point, 4326)';
  },
});

export const userSettings = core.table('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).unique(),
  primaryInterest: interestEnum('primary_interest'),
  idealLocation: geographyPoint('ideal_location'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
