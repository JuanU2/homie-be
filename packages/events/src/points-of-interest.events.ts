import { z } from 'zod';
import { eventEnvelopeSchema } from './event';

export const POINT_OF_INTEREST_LOCATION_TYPES = [
  'PUBLIC_TRANSPORT',
  'CITY_CENTER',
] as const;

export const pointOfInterestLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  locationType: z.enum(POINT_OF_INTEREST_LOCATION_TYPES),
});

export type PointOfInterestLocation = z.infer<
  typeof pointOfInterestLocationSchema
>;

export const pointsOfInterestPayloadSchema = z.object({
  propertyId: z.string().uuid(),
  points: z.array(pointOfInterestLocationSchema),
});

export type PointsOfInterestPayload = z.infer<
  typeof pointsOfInterestPayloadSchema
>;

export const POINTS_OF_INTEREST_EVENT_TYPE = 'PointsOfInterestUpdated';

export const pointsOfInterestEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal(POINTS_OF_INTEREST_EVENT_TYPE),
  payload: pointsOfInterestPayloadSchema,
});

export type PointsOfInterestEvent = z.infer<typeof pointsOfInterestEventSchema>;

export const POINTS_OF_INTEREST_ROUTING_KEY = 'points-of-interest.updated';
