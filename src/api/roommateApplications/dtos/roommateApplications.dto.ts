import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const roommateApplicationStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
]);

export const createRoommateApplicationDtoRequestSchema = z.object({
  roommateRequestId: z.uuid(),
  note: z.string().optional(),
});

export const roommateApplicationDtoResponseSchema = z.object({
  id: z.string(),
  roommateRequestId: z.string(),
  applicantId: z.string(),
  note: z.string().nullable(),
  status: roommateApplicationStatusSchema,
  createdAt: z.date(),
});

export class CreateRoommateApplicationDtoRequest extends createZodDto(
  createRoommateApplicationDtoRequestSchema,
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
