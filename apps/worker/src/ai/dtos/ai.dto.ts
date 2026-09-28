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

export const propertyImageSchema = z
  .object({
    data: z.string().min(1).optional(),
    imageUrl: z.url().optional(),
    mimeType: z.string().regex(/^image\//).optional(),
  })
  .refine((image) => (image.data ? !image.imageUrl : !!image.imageUrl), {
    message: 'Each image must provide exactly one of "data" or "imageUrl"',
  });

export type AnalyzePropertyImageInput = z.infer<typeof propertyImageSchema>;

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

export const scrapeListingSchema = z.object({
  url: z.url(),
});

export class ScrapeListingDto extends createZodDto(scrapeListingSchema) {}

const scrapeListingPropertySchema = stripNonMatching({
  description: z.string().min(1).max(5000).optional(),
  sizeM2: z.number().positive().optional(),
  roomCount: z.number().int().positive().optional(),
  rooms: z
    .array(
      z.object({
        roomType: roomTypeSchema,
        count: z.number().int().positive(),
      }),
    )
    .optional(),
  equipment: z
    .array(
      z.object({
        equipmentType: z.string().min(1).max(255),
        count: z.number().int().positive(),
      }),
    )
    .optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().min(1),
        title: z.boolean(),
      }),
    )
    .optional(),
});

function stripEmpty(value: unknown): unknown {
  if (value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  if (Array.isArray(value)) return value.map(stripEmpty);
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = stripEmpty(entry);
    }
    return result;
  }
  return value;
}


//This method is required because the Gemini API may return invalid json.
// But we do not want to dump everything, only the invalid part of the json.
function stripNonMatching(shape: Record<string, z.ZodTypeAny>) {
  return z.preprocess(
    (value: unknown): unknown => {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
      }
      const result: Record<string, unknown> = {};
      for (const [key, schema] of Object.entries(shape)) {
        const parsed = schema.safeParse((value as Record<string, unknown>)[key]);
        if (parsed.success && parsed.data !== undefined) {
          result[key] = parsed.data;
        }
      }
      return Object.keys(result).length > 0 ? result : undefined;
    },
    z.object(shape).optional(),
  );
}

export const scrapeListingResultSchema = z.preprocess(
  stripEmpty,
  z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    priceAmount: z.number().nonnegative().optional(),
    priceCurrency: z.string().min(1).optional(),
    idealMoveInDate: z.string().min(1).optional(),
    maxRoommates: z.number().int().positive().optional(),
    currentRoommates: z.number().int().nonnegative().optional(),
    property: scrapeListingPropertySchema.optional(),
  }),
);

export type ScrapeListingResult = z.infer<typeof scrapeListingResultSchema>;
