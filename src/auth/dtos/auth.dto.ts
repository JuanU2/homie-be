import z from "zod";
import { createZodDto } from "nestjs-zod";
import { getUserResponseSchema } from '@/users/dtos/users.dto';

export const authUserRequestSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.email(),
    image: z.string(),
  }),
  expires: z.string(),
  idToken: z.string(),
});

export const authUserResponseSchema = z.object({
  token: z.string(),
  user: getUserResponseSchema,
});

export class AuthUserDtoResponse extends createZodDto(authUserResponseSchema) {}

export class AuthUserDtoRequest extends createZodDto(authUserRequestSchema) {}