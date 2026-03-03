import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export enum Interest {
  FIND_HOUSING = "FIND_HOUSING",
  RENT = "RENT",
}

export const interestEnum = z.nativeEnum(Interest);

export const updateUserSettingsDtoRequestSchema = z.object({
  phoneNumber: z.string().optional(),
  primaryInterest: interestEnum.optional(),
  idealLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
})

export const updateUserSettingsDtoResponseSchema = z.object({
  userId: z.string(),
})

export class UpdateUserSettingsDtoRequest extends createZodDto(updateUserSettingsDtoRequestSchema) {}

export class UpdateUserSettingsDtoResponse extends createZodDto(updateUserSettingsDtoResponseSchema) {}