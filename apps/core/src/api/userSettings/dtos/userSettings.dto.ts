import { createZodDto } from 'nestjs-zod';
import z from 'zod';


export const interestEnum = z.enum(["FIND_HOUSING", "RENT"]);

export type Interest = z.infer<typeof interestEnum>;

export const idealLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const updateUserSettingsDtoRequestSchema = z
  .object({
    phoneNumber: z.string().optional(),
    primaryInterest: interestEnum.optional(),
    idealLocation: idealLocationSchema.optional(),
  })
  .refine(
    data =>
      data.phoneNumber !== undefined ||
      data.primaryInterest !== undefined ||
      data.idealLocation !== undefined,
    {
      message: 'At least one field must be provided',
    },
  )

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

export const userSettingsParamsSchema = z.object({
  id: z.uuid(),
});

export class UserSettingsParamsDto extends createZodDto(userSettingsParamsSchema) {}