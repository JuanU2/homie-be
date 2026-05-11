import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const roommateRequestCurrencySchema = z.enum(['EUR', 'CZK', 'USD']);
export const roommateRequestStatusSchema = z.enum([
  'ACTIVE',
  'RESERVED',
  'CLOSED',
  'EXPIRED',
]);

export const createRoommateRequestDtoRequestSchema = z.object({
  propertyId: z.string(),
  description: z.string(),
  priceAmount: z.number().int().positive(),
  priceCurrency: roommateRequestCurrencySchema,
  idealMoveInDate: z.string().optional(),
  maxRoommates: z.number().int().positive(),
  currentRoommates: z.number().int().nonnegative(),
});

export const roommateRequestDtoResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  createdBy: z.string(),
  description: z.string(),
  priceAmount: z.number().int(),
  priceCurrency: roommateRequestCurrencySchema,
  idealMoveInDate: z.string().nullable(),
  maxRoommates: z.number().int(),
  currentRoommates: z.number().int(),
  status: roommateRequestStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  closedAt: z.date().nullable(),
});

export class CreateRoommateRequestDtoRequest extends createZodDto(
  createRoommateRequestDtoRequestSchema,
) {}

export class RoommateRequestDtoResponse extends createZodDto(
  roommateRequestDtoResponseSchema,
) {}
