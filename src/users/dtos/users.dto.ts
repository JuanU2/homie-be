import z from "zod";
import { createZodDto } from "nestjs-zod";

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
});

export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getUserReponseSchema = createUserResponseSchema;

export class CreateUserDtoRequest extends createZodDto(createUserSchema) {}

export class CreateUserDtoResponse extends createZodDto(
  createUserResponseSchema,
) {}
