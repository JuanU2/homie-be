import { date, integer, numeric, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { properties } from './properties.schema';
import { users } from './users.schema';

export const currencyEnum = core.enum('currency_enum', ['EUR', 'CZK', 'USD']);

export const listingStatusEnum = core.enum(
  'listing_status_enum',
  ['ACTIVE', 'RESERVED', 'CLOSED', 'EXPIRED'],
);

export const preferredGenderEnum = core.enum('preferred_gender_enum', [
  'MALE',
  'FEMALE',
  'ALL',
]);

export const listings = core.table('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .references(() => properties.id, { onDelete: 'cascade' })
    .notNull(),
  createdBy: uuid('created_by')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priceAmount: integer('price_amount').notNull(),
  priceCurrency: currencyEnum('price_currency').notNull(),
  priceEur: numeric('price_eur', { precision: 18, scale: 8 }),
  idealMoveInDate: date('ideal_move_in_date'),
  maxRoommates: integer('max_roommates').notNull(),
  currentRoommates: integer('current_roommates').notNull(),
  status: listingStatusEnum('status').default('ACTIVE').notNull(),
  preferredGender: preferredGenderEnum('preferred_gender')
    .default('ALL')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
});
