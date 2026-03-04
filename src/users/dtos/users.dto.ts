import z from "zod";
import { getUserSettingsSchema } from '@/userSettings/dtos/userSettings.dto';
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
