import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createFavouriteDtoRequestSchema = z.object({
  roommateRequestId: z.uuid(),
});

export class CreateFavouriteDtoRequest extends createZodDto(
  createFavouriteDtoRequestSchema,
) {}

export const favouriteParamsSchema = z.object({
  roommateRequestId: z.uuid(),
});

export class FavouriteParamsDto extends createZodDto(favouriteParamsSchema) {}

export const favouriteDtoResponseSchema = z.object({
  id: z.string(),
  roommateRequestId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
});

export class FavouriteDtoResponse extends createZodDto(
  favouriteDtoResponseSchema,
) {}

export const getFavouritesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

export class GetFavouritesQueryDto extends createZodDto(
  getFavouritesQuerySchema,
) {}
