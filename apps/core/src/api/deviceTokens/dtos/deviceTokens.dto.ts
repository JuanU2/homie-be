import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createDeviceTokenDtoRequestSchema = z.object({
  token: z.string().min(1),
});

export class CreateDeviceTokenDtoRequest extends createZodDto(
  createDeviceTokenDtoRequestSchema,
) {}

export const deviceTokenDtoResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class DeviceTokenDtoResponse extends createZodDto(
  deviceTokenDtoResponseSchema,
) {}
