import { text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { roommateRequests } from './roommateRequests.schema';
import { users } from './users.schema';

export const roommateApplicationStatusEnum = core.enum(
  'roommate_application_status_enum',
  ['PENDING', 'ACCEPTED', 'REJECTED'],
);

export const roommateApplications = core.table('roommate_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  roommateRequestId: uuid('roommate_request_id')
    .references(() => roommateRequests.id, { onDelete: 'cascade' })
    .notNull(),
  applicantId: uuid('applicant_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: roommateApplicationStatusEnum('status').default('PENDING').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
