import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createPropertyRequestSchema = z.object({
  ownerId: z.string(),
  description: z.string(),
  sizeM2: z.number().positive().optional(),
  roomCount: z.number().positive(),
  country: z.string().max(100),
  city: z.string().max(100),
  zipCode: z.string().max(20),
  street: z.string().max(100),
  streetNumber: z.string().max(10),
  location: z.string().max(1000),
});

export const createPropertyResponseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  description: z.string(),
  sizeM2: z.number().positive().optional(),
  roomCount: z.number().positive(),
  country: z.string().max(100),
  city: z.string().max(100),
  zipCode: z.string().max(20),
  street: z.string().max(100),
  streetNumber: z.string().max(10),
  location: z.string().max(1000),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class CreatePropertyDtoRequest extends createZodDto(
  createPropertyRequestSchema
) {}

export class CreatePropertyDtoResponse extends createZodDto(
  createPropertyResponseSchema,
) {}
