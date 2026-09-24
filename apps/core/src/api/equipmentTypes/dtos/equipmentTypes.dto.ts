import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const equipmentTypeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export class EquipmentTypeResponseDto extends createZodDto(
  equipmentTypeResponseSchema,
) {}

export const createEquipmentTypeDtoSchema = z.object({
  name: z.string().min(1),
});

export class CreateEquipmentTypeDtoRequest extends createZodDto(
  createEquipmentTypeDtoSchema,
) {}
