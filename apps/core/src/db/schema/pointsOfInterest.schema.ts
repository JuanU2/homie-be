import { doublePrecision, timestamp, uuid } from 'drizzle-orm/pg-core';
import { core } from './core';
import { properties } from './properties.schema';

export const pointOfInterestLocationTypeEnum = core.enum(
  'point_of_interest_location_type_enum',
  ['PUBLIC_TRANSPORT', 'CITY_CENTER'],
);

export const pointsOfInterest = core.table('points_of_interest', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .references(() => properties.id, { onDelete: 'cascade' })
    .notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  locationType: pointOfInterestLocationTypeEnum('location_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
