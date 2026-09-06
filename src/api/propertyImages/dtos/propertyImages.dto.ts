import { createZodDto } from "nestjs-zod";
import z from "zod";

export const propertyImageResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  imageUrl: z.string(),
  title: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PropertyImageResponse extends createZodDto(
  propertyImageResponseSchema,
) {}

export const propertyImagesParamsSchema = z.object({
  propertyId: z.uuid(),
});

export class PropertyImagesParamsDto extends createZodDto(
  propertyImagesParamsSchema,
) {}

export const propertyImageParamsSchema = z.object({
  propertyId: z.uuid(),
  imageId: z.uuid(),
});

export class PropertyImageParamsDto extends createZodDto(
  propertyImageParamsSchema,
) {}
