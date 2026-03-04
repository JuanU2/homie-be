import { createZodDto } from 'nestjs-zod';
import z from 'zod';


export const interestEnum = z.enum(["FIND_HOUSING", "RENT"]);

export type Interest = z.infer<typeof interestEnum>;

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
  phoneNumber: z.string().optional().nullable(),
  primaryInterest: interestEnum.optional().nullable(),
  idealLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional().nullable(),
})

export const getUserSettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  phoneNumber: z.string().nullable().optional(),
  primaryInterest: interestEnum.nullable().optional(),
  idealLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable().optional(),
})

export class UpdateUserSettingsDtoRequest extends createZodDto(updateUserSettingsDtoRequestSchema) {}

export class UpdateUserSettingsDtoResponse extends createZodDto(updateUserSettingsDtoResponseSchema) {}