import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { roommateRequests } from '@/db/schema/roommateRequests.schema';
import { users } from '@/db/schema/users.schema';

export const roommateApplicationStatusEnum = pgEnum(
  "roommate_application_status_enum",
  ["PENDING", "ACCEPTED", "REJECTED"],
);

export const roommateApplications = pgTable("roommate_applications", {
  id: uuid("id").defaultRandom().primaryKey(),

  roommateRequestId: uuid("roommate_request_id")
    .references(() => roommateRequests.id, { onDelete: "cascade" })
    .notNull(),

  applicantId: uuid("applicant_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  status: roommateApplicationStatusEnum("status").default("PENDING").notNull(),

  note: text("note"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});