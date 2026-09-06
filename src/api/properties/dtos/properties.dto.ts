import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export enum roomTypeEnum {
  DORMITORY = 'DORMITORY',
  BATHROOM = 'BATHROOM',
  KITCHEN = 'KITCHEN',
  LIVING_ROOM = 'LIVING_ROOM',
  TOILET = 'TOILET',
  WARDROBE = 'WARDROBE',
  BALCONY = 'BALCONY',
  OTHER = 'OTHER',
}

export const roomsSchema = z.object({
  roomType: z.nativeEnum(roomTypeEnum),
  count: z.number().int().positive(),
});

export const equipmentSchema = z.object({
  equipmentType: z.string().min(1).max(255),
  count: z.number().int().positive(),
});

export const createPropertyRequestSchema = z.object({
  ownerId: z.uuid(),
  description: z.string().min(1),
  sizeM2: z.number().positive().optional(),
  roomCount: z.number().positive(),
  country: z.string().max(100),
  city: z.string().max(100),
  zipCode: z.string().max(20),
  street: z.string().max(100),
  streetNumber: z.string().max(10),
  lat: z.number().refine((val) => val >= -90 && val <= 90, {
    message: 'Latitude must be between -90 and 90',
  }),
  lng: z.number().refine((val) => val >= -180 && val <= 180, {
    message: 'Longitude must be between -180 and 180',
  }),
  rooms: z.array(roomsSchema),
  equipment: z.array(equipmentSchema),
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
  lat: z.number().refine((val) => val >= -90 && val <= 90, {
    message: 'Latitude must be between -90 and 90',
  }),
  lng: z.number().refine((val) => val >= -180 && val <= 180, {
    message: 'Longitude must be between -180 and 180',
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  rooms: z.array(roomsSchema),
  equipment: z.array(equipmentSchema),
});

export class CreatePropertyDtoRequest extends createZodDto(
  createPropertyRequestSchema
) {}

export class CreatePropertyDtoResponse extends createZodDto(
  createPropertyResponseSchema,
) {}
