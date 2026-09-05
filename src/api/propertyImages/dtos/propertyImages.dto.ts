import { createZodDto } from "nestjs-zod";
import z from "zod";

export const propertyImageResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  imageUrl: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PropertyImageResponse extends createZodDto(
  propertyImageResponseSchema,
) {}
