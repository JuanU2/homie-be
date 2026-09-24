import { z } from 'zod';
import { eventEnvelopeSchema } from './event';
import { propertyDataSchema } from './property.events';

export const roommateRequestBlobSchema = z.object({
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

export type RoommateRequestBlob = z.infer<typeof roommateRequestBlobSchema>;

export const ROOMMATE_REQUEST_CREATED_EVENT_TYPE = 'RoommateRequestCreated';
export const ROOMMATE_REQUEST_UPDATED_EVENT_TYPE = 'RoommateRequestUpdated';

export const roommateRequestCreatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal(ROOMMATE_REQUEST_CREATED_EVENT_TYPE),
  payload: roommateRequestBlobSchema,
});

export const roommateRequestUpdatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal(ROOMMATE_REQUEST_UPDATED_EVENT_TYPE),
  payload: roommateRequestBlobSchema,
});

export type RoommateRequestCreatedEvent = z.infer<
  typeof roommateRequestCreatedEventSchema
>;
export type RoommateRequestUpdatedEvent = z.infer<
  typeof roommateRequestUpdatedEventSchema
>;

export const ROOMMATE_REQUEST_CREATED_ROUTING_KEY = 'roommate-request.created';
export const ROOMMATE_REQUEST_UPDATED_ROUTING_KEY = 'roommate-request.updated';
