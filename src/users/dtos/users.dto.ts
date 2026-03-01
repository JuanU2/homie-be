import z from "zod";
import { createZodDto } from "nestjs-zod";

export const createUserRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  fullName: z.string(),
  phone: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getUserReponseSchema = createUserResponseSchema;

export class CreateUserDtoRequest extends createZodDto(createUserRequestSchema) {}

export class CreateUserDtoResponse extends createZodDto(
  createUserResponseSchema,
) {}
