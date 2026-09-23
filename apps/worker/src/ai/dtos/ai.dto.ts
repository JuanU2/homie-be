import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ROOM_TYPES = [
  'DORMITORY',
  'BATHROOM',
  'KITCHEN',
  'LIVING_ROOM',
  'TOILET',
  'WARDROBE',
  'BALCONY',
  'OTHER',
] as const;

const roomTypeSchema = z.enum(ROOM_TYPES);

export const propertyImageSchema = z.object({
  data: z.string().min(1),
  mimeType: z.string().regex(/^image\//),
});

export const locationSchema = z.object({
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
});

export type PropertyLocation = z.infer<typeof locationSchema>;

export const analyzePropertyImagesSchema = z.object({
  images: z.array(propertyImageSchema).min(1).max(20),
  language: z.string().trim().min(1).max(50).optional(),
  location: locationSchema.optional(),
});

export class AnalyzePropertyImagesDto extends createZodDto(
  analyzePropertyImagesSchema,
) {}

export const propertyAnalysisResultSchema = z.object({
  description: z.string(),
  sizeM2: z.number().positive().nullable(),
  roomCount: z.number().int().nonnegative(),
  rooms: z.array(
    z.object({
      roomType: roomTypeSchema,
      count: z.number().int().positive(),
    }),
  ),
  equipment: z.array(
    z.object({
      equipmentType: z.string().min(1).max(255),
      count: z.number().int().positive(),
    }),
  ),
});

export type PropertyAnalysisResult = z.infer<typeof propertyAnalysisResultSchema>;
