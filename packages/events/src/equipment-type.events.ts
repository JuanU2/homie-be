import { z } from 'zod';
import { eventEnvelopeSchema } from './event';

export const EQUIPMENT_TYPE_CREATED_EVENT_TYPE = 'EquipmentTypeCreated';

export const equipmentTypeCreatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal(EQUIPMENT_TYPE_CREATED_EVENT_TYPE),
  payload: z.object({
    name: z.string().min(1),
  }),
});

export type EquipmentTypeCreatedEvent = z.infer<
  typeof equipmentTypeCreatedEventSchema
>;

export const EQUIPMENT_TYPE_CREATED_ROUTING_KEY = 'equipment-type.created';
