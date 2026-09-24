import { z } from 'zod';

export const eventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  occurredAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
