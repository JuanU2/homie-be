import { text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { listings } from './listings.schema';
import { users } from './users.schema';

export const roommateApplicationStatusEnum = core.enum(
  'roommate_application_status_enum',
  [
    'PENDING',
    'VIEWING_OFFERED',
    'VIEWING_CONFIRMED',
    'VIEWING_DECLINED',
    'ACCEPTED',
    'REJECTED',
  ],
);

export const roommateApplications = core.table('roommate_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id')
    .references(() => listings.id, { onDelete: 'cascade' })
    .notNull(),
  applicantId: uuid('applicant_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: roommateApplicationStatusEnum('status').default('PENDING').notNull(),
  note: text('note'),
  viewingOptions: timestamp('viewing_options', {
    withTimezone: true,
  }).array(),
  viewingChosenAt: timestamp('viewing_chosen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
