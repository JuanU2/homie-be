import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const equipmentTypeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export class EquipmentTypeResponseDto extends createZodDto(
  equipmentTypeResponseSchema,
) {}
