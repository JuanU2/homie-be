import z from "zod";
import { getUserSettingsSchema } from '@/api/userSettings/dtos/userSettings.dto';
import { createZodDto } from 'nestjs-zod';

export const getUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userSettings: getUserSettingsSchema
});

export class GetUserDtoResponse extends createZodDto(getUserResponseSchema) {}

export const getUserParamsSchema = z.object({
  id: z.uuid(),
});

export class GetUserParamsDto extends createZodDto(getUserParamsSchema) {}
