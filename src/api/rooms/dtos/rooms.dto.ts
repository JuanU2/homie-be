import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { roomTypeEnum } from '@/api/properties/dtos/properties.dto';

export { roomTypeEnum };

export const createRoomDtoRequestSchema = z.object({
  propertyId: z.uuid(),
  roomType: z.nativeEnum(roomTypeEnum),
  count: z.number().int().positive(),
});

export const patchRoomDtoRequestSchema = z.object({
  roomType: z.nativeEnum(roomTypeEnum).optional(),
  count: z.number().int().positive().optional(),
}).refine(data => data.roomType !== undefined || data.count !== undefined, {
  message: 'At least one field must be provided',
});

export const roomDtoResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  roomType: z.nativeEnum(roomTypeEnum),
  count: z.number().int().positive(),
});

export class CreateRoomDtoRequest extends createZodDto(
  createRoomDtoRequestSchema,
) {}

export class PatchRoomDtoRequest extends createZodDto(
  patchRoomDtoRequestSchema,
) {}

export class RoomDtoResponse extends createZodDto(
  roomDtoResponseSchema,
) {}

export const roomParamsSchema = z.object({
  id: z.uuid(),
});

export class RoomParamsDto extends createZodDto(roomParamsSchema) {}
