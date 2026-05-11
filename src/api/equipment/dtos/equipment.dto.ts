import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createEquipmentDtoRequestSchema = z.object({
  propertyId: z.string(),
  equipmentType: z.string().min(1).max(255),
  count: z.number().int().positive(),
});

export const patchEquipmentDtoRequestSchema = z.object({
  count: z.number().int().positive(),
});

export const equipmentDtoResponseSchema = z.object({
  propertyId: z.string(),
  equipmentType: z.string().min(1).max(255),
  count: z.number().int().positive(),
});

export class CreateEquipmentDtoRequest extends createZodDto(
  createEquipmentDtoRequestSchema,
) {}

export class PatchEquipmentDtoRequest extends createZodDto(
  patchEquipmentDtoRequestSchema,
) {}

export class EquipmentDtoResponse extends createZodDto(
  equipmentDtoResponseSchema,
) {}
