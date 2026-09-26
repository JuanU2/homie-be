import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PLACE_CATEGORIES = [
  'PUBLIC_TRANSPORT',
  'SUPERMARKET',
  'CITY_CENTER',
  'LIBRARY',
  'SHOPPING_CENTER',
  'SCHOOL',
  'HOSPITAL',
  'PARKING',
  'OTHER',
] as const;

export const TRANSPORT_TYPES = ['CAR', 'WALK', 'PUBLIC_TRANSPORT', 'BIKE'] as const;

const coordinatesSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const nearbyPlaceSchema = z.object({
  placeCategory: z.enum(PLACE_CATEGORIES),
  location: coordinatesSchema,
  name: z.string().min(1),
  distance: z.object({
    distanceApproxMeters: z.coerce.number().int().nonnegative(),
    distanceApproxTime: z.object({
      transportType: z.enum(TRANSPORT_TYPES),
      timeInMinutes: z.coerce.number().int().nonnegative(),
    }),
  }),
});

export const propertyInsightsSchema = z.object({
  nearbyPlaces: z.array(nearbyPlaceSchema).max(3),
  advantages: z.array(z.string().min(1)).max(5),
});

export type PropertyInsights = z.infer<typeof propertyInsightsSchema>;

const nearbyPlaceAiSchema = nearbyPlaceSchema.extend({
  fulltextSearchTerm: z.string().min(1),
});

export const propertyInsightsAiSchema = z.object({
  nearbyPlaces: z.array(nearbyPlaceAiSchema).max(3),
  advantages: z.array(z.string().min(1)).max(5),
});

export type PropertyInsightsAiResponse = z.infer<
  typeof propertyInsightsAiSchema
>;

export interface PropertyLocation {
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  lat: number;
  lng: number;
}

export interface PropertyInsightsInput extends PropertyLocation {
  id: string;
  description: string;
}

export const propertyInsightsParamsSchema = z.object({
  propertyId: z.uuid(),
});

export class PropertyInsightsParamsDto extends createZodDto(
  propertyInsightsParamsSchema,
) {}
