import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const roommateApplicationStatusSchema = z.enum([
  'PENDING',
  'VIEWING_OFFERED',
  'VIEWING_CONFIRMED',
  'VIEWING_DECLINED',
  'ACCEPTED',
  'REJECTED',
]);

export const createRoommateApplicationDtoRequestSchema = z.object({
  listingId: z.uuid(),
  note: z.string().optional(),
});

export const roommateApplicationDtoResponseSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  applicantId: z.string(),
  note: z.string().nullable(),
  status: roommateApplicationStatusSchema,
  viewingOptions: z.array(z.date()).nullable(),
  viewingChosenAt: z.date().nullable(),
  createdAt: z.date(),
});

export const updateRoommateApplicationDtoRequestSchema = z.object({
  status: roommateApplicationStatusSchema,
  incrementCurrentRoommates: z.boolean().optional(),
  dateTimes: z.array(z.iso.datetime()).min(1).max(3).optional(),
  dateTime: z.iso.datetime().optional(),
});

export class CreateRoommateApplicationDtoRequest extends createZodDto(
  createRoommateApplicationDtoRequestSchema,
) {}

export class UpdateRoommateApplicationDtoRequest extends createZodDto(
  updateRoommateApplicationDtoRequestSchema,
) {}

export class RoommateApplicationDtoResponse extends createZodDto(
  roommateApplicationDtoResponseSchema,
) {}

export const getRoommateApplicationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
  status: roommateApplicationStatusSchema.optional(),
});

export class GetRoommateApplicationsQueryDto extends createZodDto(
  getRoommateApplicationsQuerySchema,
) {}

export const roommateApplicationApplicantResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
});

export const roommateApplicationWithApplicantResponseSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  applicantId: z.string(),
  note: z.string().nullable(),
  status: roommateApplicationStatusSchema,
  viewingOptions: z.array(z.date()).nullable(),
  viewingChosenAt: z.date().nullable(),
  createdAt: z.date(),
  applicant: roommateApplicationApplicantResponseSchema,
});

export class RoommateApplicationWithApplicantDtoResponse extends createZodDto(
  roommateApplicationWithApplicantResponseSchema,
) {}

export const roommateApplicationParamsSchema = z.object({
  listingId: z.uuid(),
});

export class RoommateApplicationParamsDto extends createZodDto(
  roommateApplicationParamsSchema,
) {}

export const roommateApplicationIdParamsSchema = z.object({
  roommateApplicationId: z.uuid(),
});

export class RoommateApplicationIdParamsDto extends createZodDto(
  roommateApplicationIdParamsSchema,
) {}

export const roommateApplicationListItemWithApplicantResponseSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  propertyId: z.string(),
  status: roommateApplicationStatusSchema,
  note: z.string().nullable(),
  viewingOptions: z.array(z.date()).nullable(),
  viewingChosenAt: z.date().nullable(),
  createdAt: z.date(),
  title: z.string(),
  titleImageId: z.string().nullable(),
  applicant: roommateApplicationApplicantResponseSchema,
});

export const roommateApplicationsWithApplicantPageResponseSchema = z.object({
  items: z.array(roommateApplicationListItemWithApplicantResponseSchema),
  nextCursor: z.string().nullable(),
});

export class RoommateApplicationsWithApplicantPageDtoResponse extends createZodDto(
  roommateApplicationsWithApplicantPageResponseSchema,
) {}

export const userRoommateApplicationsParamsSchema = z.object({
  userId: z.uuid(),
});

export class UserRoommateApplicationsParamsDto extends createZodDto(
  userRoommateApplicationsParamsSchema,
) {}

export const countRoommateApplicationsQuerySchema = z.object({
  status: roommateApplicationStatusSchema.optional(),
});

export class CountRoommateApplicationsQueryDto extends createZodDto(
  countRoommateApplicationsQuerySchema,
) {}

export const roommateApplicationsCountResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});

export class RoommateApplicationsCountDtoResponse extends createZodDto(
  roommateApplicationsCountResponseSchema,
) {}
