import { createZodDto } from 'nestjs-zod';
import { roomTypeEnum } from '@/api/properties/dtos/properties.dto';
import {
  roommateApplicationDtoResponseSchema,
  roommateApplicationWithApplicantResponseSchema,
} from '@/api/roommateApplications/dtos/roommateApplications.dto';
import z from 'zod';

export const listingCurrencySchema = z.enum(['EUR', 'CZK', 'USD']);
export const listingStatusSchema = z.enum([
  'ACTIVE',
  'RESERVED',
  'CLOSED',
  'EXPIRED',
]);

export const roommatePreferredGenderSchema = z.enum(['MALE', 'FEMALE', 'ALL']);

export const createListingDtoRequestSchema = z
  .object({
    propertyId: z.uuid(),
    title: z.string().min(1),
    description: z.string().min(1),
    priceAmount: z.number().int().positive(),
    priceCurrency: listingCurrencySchema,
    idealMoveInDate: z.string().min(1).optional(),
    maxRoommates: z.number().int().positive(),
    currentRoommates: z.number().int().nonnegative(),
    preferredGender: roommatePreferredGenderSchema,
  })
  .refine(data => data.currentRoommates <= data.maxRoommates, {
    message: 'currentRoommates must not exceed maxRoommates',
    path: ['currentRoommates'],
  });

export const updateListingDtoRequestSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    priceAmount: z.number().int().positive(),
    priceCurrency: listingCurrencySchema,
    idealMoveInDate: z.string().min(1).optional(),
    maxRoommates: z.number().int().positive(),
    currentRoommates: z.number().int().nonnegative(),
    preferredGender: roommatePreferredGenderSchema,
  })
  .refine(data => data.currentRoommates <= data.maxRoommates, {
    message: 'currentRoommates must not exceed maxRoommates',
    path: ['currentRoommates'],
  });

export const listingDtoResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  createdBy: z.string(),
  title: z.string(),
  description: z.string(),
  priceAmount: z.number().int(),
  priceCurrency: listingCurrencySchema,
  idealMoveInDate: z.string().nullable(),
  maxRoommates: z.number().int(),
  currentRoommates: z.number().int(),
  status: listingStatusSchema,
  preferredGender: roommatePreferredGenderSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  closedAt: z.date().nullable(),
});

export class CreateListingDtoRequest extends createZodDto(
  createListingDtoRequestSchema,
) {}

export class UpdateListingDtoRequest extends createZodDto(
  updateListingDtoRequestSchema,
) {}

export const updateListingStatusDtoRequestSchema = z
  .object({
    status: listingStatusSchema,
    maxRoommates: z.number().int().positive().optional(),
    currentRoommates: z.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'ACTIVE') {
      return;
    }

    if (data.maxRoommates !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'maxRoommates is only allowed when transitioning to ACTIVE',
        path: ['maxRoommates'],
      });
    }
    if (data.currentRoommates !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'currentRoommates is only allowed when transitioning to ACTIVE',
        path: ['currentRoommates'],
      });
    }
  });

export class UpdateListingStatusDtoRequest extends createZodDto(
  updateListingStatusDtoRequestSchema,
) {}

export class ListingDtoResponse extends createZodDto(
  listingDtoResponseSchema,
) {}

export const listingOwnerResponseSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
});

export const listingPropertyImageResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  imageUrl: z.string(),
  title: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const listingPropertyRoomResponseSchema = z.object({
  roomType: z.nativeEnum(roomTypeEnum),
  count: z.number().int(),
});

export const listingPropertyEquipmentResponseSchema = z.object({
  equipmentType: z.string(),
  count: z.number().int(),
});

export const listingPropertyDetailResponseSchema = z.object({
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
  rooms: z.array(listingPropertyRoomResponseSchema),
  equipment: z.array(listingPropertyEquipmentResponseSchema),
  images: z.array(listingPropertyImageResponseSchema),
});

export const listingDetailDtoResponseSchema =
  listingDtoResponseSchema.extend({
    owner: listingOwnerResponseSchema,
    property: listingPropertyDetailResponseSchema,
    canApply: z.boolean(),
    application: roommateApplicationDtoResponseSchema.optional(),
    favourite: z.boolean(),
  });

export class ListingDetailDtoResponse extends createZodDto(
  listingDetailDtoResponseSchema,
) {}

export const userListingDetailDtoResponseSchema =
  listingDetailDtoResponseSchema.extend({
    applications: z.array(roommateApplicationWithApplicantResponseSchema),
  });

export class UserListingDetailDtoResponse extends createZodDto(
  userListingDetailDtoResponseSchema,
) {}

export const userListingDetailParamsSchema = z.object({
  userId: z.uuid(),
  listingId: z.uuid(),
});

export class UserListingDetailParamsDto extends createZodDto(
  userListingDetailParamsSchema,
) {}

export const listingParamsSchema = z.object({
  listingId: z.uuid(),
});

export class ListingParamsDto extends createZodDto(
  listingParamsSchema,
) {}

export const listingSortBySchema = z.enum([
  'PRICE',
  'DISTANCE_TRANSIT',
  'DISTANCE_CITY_CENTER',
]);

const queryStringArray = z.preprocess(
  (value) =>
    value === undefined
      ? undefined
      : Array.isArray(value)
        ? value
        : [value],
  z.array(z.string().min(1)).optional(),
);

const queryRoomTypesArray = z.preprocess(
  (value) =>
    value === undefined
      ? undefined
      : Array.isArray(value)
        ? value
        : [value],
  z.array(z.nativeEnum(roomTypeEnum)).optional(),
);

const querySortByArray = z.preprocess(
  (value) =>
    value === undefined
      ? undefined
      : Array.isArray(value)
        ? value
        : [value],
  z.array(listingSortBySchema).optional(),
);

export const getListingsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  priceFrom: z.coerce.number().int().nonnegative().optional(),
  priceTo: z.coerce.number().int().nonnegative().optional(),
  equipment: queryStringArray,
  rooms: queryRoomTypesArray,
  sortBy: querySortByArray,
  preferredGender: roommatePreferredGenderSchema.optional(),
});

export class GetListingsQueryDto extends createZodDto(
  getListingsQuerySchema,
) {}

export const userListingParamsSchema = z.object({
  userId: z.uuid(),
});

export class UserListingParamsDto extends createZodDto(
  userListingParamsSchema,
) {}

export const getUserListingsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
  status: listingStatusSchema.optional(),
});

export class GetUserListingsQueryDto extends createZodDto(
  getUserListingsQuerySchema,
) {}
