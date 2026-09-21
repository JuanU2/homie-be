import z from "zod";
import { createZodDto } from "nestjs-zod";
import { getUserResponseSchema } from '@/api/users/dtos/users.dto';

export const authUserRequestSchema = z.object({
  idToken: z.string(),
});

export const authUserResponseSchema = z.object({
  user: getUserResponseSchema,
});

export class AuthUserDtoResponse extends createZodDto(authUserResponseSchema) {}

export class AuthUserDtoRequest extends createZodDto(authUserRequestSchema) {}