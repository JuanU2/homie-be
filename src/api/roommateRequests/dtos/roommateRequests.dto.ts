import { createZodDto } from 'nestjs-zod';
import { roomTypeEnum } from '@/api/properties/dtos/properties.dto';
import { roommateApplicationWithApplicantResponseSchema } from '@/api/roommateApplications/dtos/roommateApplications.dto';
import z from 'zod';

export const roommateRequestCurrencySchema = z.enum(['EUR', 'CZK', 'USD']);
export const roommateRequestStatusSchema = z.enum([
  'ACTIVE',
  'RESERVED',
  'CLOSED',
  'EXPIRED',
]);

export const createRoommateRequestDtoRequestSchema = z
  .object({
    propertyId: z.uuid(),
    title: z.string().min(1),
    description: z.string().min(1),
    priceAmount: z.number().int().positive(),
    priceCurrency: roommateRequestCurrencySchema,
    idealMoveInDate: z.string().min(1).optional(),
    maxRoommates: z.number().int().positive(),
    currentRoommates: z.number().int().nonnegative(),
  })
  .refine(data => data.currentRoommates <= data.maxRoommates, {
    message: 'currentRoommates must not exceed maxRoommates',
    path: ['currentRoommates'],
  });

export const roommateRequestDtoResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  createdBy: z.string(),
  title: z.string(),
  description: z.string(),
  priceAmount: z.number().int(),
  priceCurrency: roommateRequestCurrencySchema,
  idealMoveInDate: z.string().nullable(),
  maxRoommates: z.number().int(),
  currentRoommates: z.number().int(),
  status: roommateRequestStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  closedAt: z.date().nullable(),
});

export class CreateRoommateRequestDtoRequest extends createZodDto(
  createRoommateRequestDtoRequestSchema,
) {}

export class RoommateRequestDtoResponse extends createZodDto(
  roommateRequestDtoResponseSchema,
) {}

export const roommateRequestOwnerResponseSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
});

export const roommateRequestPropertyImageResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  imageUrl: z.string(),
  title: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const roommateRequestPropertyRoomResponseSchema = z.object({
  roomType: z.nativeEnum(roomTypeEnum),
  count: z.number().int(),
});

export const roommateRequestPropertyEquipmentResponseSchema = z.object({
  equipmentType: z.string(),
  count: z.number().int(),
});

export const roommateRequestPropertyDetailResponseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  description: z.string(),
  sizeM2: z.number().nullable().optional(),
  roomCount: z.number().int(),
  country: z.string(),
  city: z.string(),
  zipCode: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  lat: z.number(),
  lng: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  rooms: z.array(roommateRequestPropertyRoomResponseSchema),
  equipment: z.array(roommateRequestPropertyEquipmentResponseSchema),
  images: z.array(roommateRequestPropertyImageResponseSchema),
});

export const roommateRequestDetailDtoResponseSchema =
  roommateRequestDtoResponseSchema.extend({
    owner: roommateRequestOwnerResponseSchema,
    property: roommateRequestPropertyDetailResponseSchema,
  });

export class RoommateRequestDetailDtoResponse extends createZodDto(
  roommateRequestDetailDtoResponseSchema,
) {}

export const userRoommateRequestDetailDtoResponseSchema =
  roommateRequestDetailDtoResponseSchema.extend({
    applications: z.array(roommateApplicationWithApplicantResponseSchema),
  });

export class UserRoommateRequestDetailDtoResponse extends createZodDto(
  userRoommateRequestDetailDtoResponseSchema,
) {}

export const userRoommateRequestDetailParamsSchema = z.object({
  userId: z.uuid(),
  roommateRequestId: z.uuid(),
});

export class UserRoommateRequestDetailParamsDto extends createZodDto(
  userRoommateRequestDetailParamsSchema,
) {}

export const roommateRequestParamsSchema = z.object({
  roommateRequestId: z.uuid(),
});

export class RoommateRequestParamsDto extends createZodDto(
  roommateRequestParamsSchema,
) {}

export const getRoommateRequestsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export class GetRoommateRequestsQueryDto extends createZodDto(
  getRoommateRequestsQuerySchema,
) {}

export const userRoommateRequestParamsSchema = z.object({
  userId: z.uuid(),
});

export class UserRoommateRequestParamsDto extends createZodDto(
  userRoommateRequestParamsSchema,
) {}

export const getUserRoommateRequestsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

export class GetUserRoommateRequestsQueryDto extends createZodDto(
  getUserRoommateRequestsQuerySchema,
) {}
