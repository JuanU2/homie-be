import { z } from 'zod';
import { eventEnvelopeSchema } from './event';
import { propertyDataSchema } from './property.events';

export const listingBlobSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  priceAmount: z.number().int(),
  priceCurrency: z.enum(['EUR', 'CZK', 'USD']),
  idealMoveInDate: z.string().nullable(),
  maxRoommates: z.number().int(),
  currentRoommates: z.number().int(),
  status: z.enum(['ACTIVE', 'RESERVED', 'CLOSED', 'EXPIRED']),
  createdAt: z.string(),
  updatedAt: z.string(),
  closedAt: z.string().nullable(),
  property: propertyDataSchema,
});

export type ListingBlob = z.infer<typeof listingBlobSchema>;

export const LISTING_CREATED_EVENT_TYPE = 'ListingCreated';
export const LISTING_UPDATED_EVENT_TYPE = 'ListingUpdated';

export const listingCreatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal(LISTING_CREATED_EVENT_TYPE),
  payload: listingBlobSchema,
});

export const listingUpdatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal(LISTING_UPDATED_EVENT_TYPE),
  payload: listingBlobSchema,
});

export type ListingCreatedEvent = z.infer<
  typeof listingCreatedEventSchema
>;
export type ListingUpdatedEvent = z.infer<
  typeof listingUpdatedEventSchema
>;

export const LISTING_CREATED_ROUTING_KEY = 'listing.created';
export const LISTING_UPDATED_ROUTING_KEY = 'listing.updated';
