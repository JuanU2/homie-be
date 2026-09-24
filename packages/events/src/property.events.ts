import { z } from 'zod';
import { eventEnvelopeSchema } from './event';

const propertyRoomSchema = z.object({
  roomType: z.string(),
  count: z.number().int(),
});

const propertyEquipmentSchema = z.object({
  equipmentType: z.string(),
  count: z.number().int(),
});

const propertyImageSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  imageUrl: z.string(),
  title: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const propertyDataSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  sizeM2: z.number().nullable().optional(),
  roomCount: z.number().int(),
  country: z.string(),
  city: z.string(),
  zipCode: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  lat: z.number(),
  lng: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  rooms: z.array(propertyRoomSchema),
  equipment: z.array(propertyEquipmentSchema),
  images: z.array(propertyImageSchema),
});

export type PropertyData = z.infer<typeof propertyDataSchema>;

export const propertyUpdatedPayloadSchema = propertyDataSchema.omit({
  images: true,
});

export type PropertyUpdatedPayload = z.infer<
  typeof propertyUpdatedPayloadSchema
>;

export const PROPERTY_UPDATED_EVENT_TYPE = 'PropertyUpdated';

export const propertyUpdatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal(PROPERTY_UPDATED_EVENT_TYPE),
  payload: propertyUpdatedPayloadSchema,
});

export type PropertyUpdatedEvent = z.infer<typeof propertyUpdatedEventSchema>;

export const PROPERTY_UPDATED_ROUTING_KEY = 'property.updated';
