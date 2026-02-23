import z from "zod";
import { createZodDto } from "nestjs-zod";

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  primaryInterest: z.enum(["FIND_HOUSING", "RENT"]),
  idealLocation: z.string().optional(), // GeoJSON / WKT
  phone: z.string().optional(),
});

export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  primaryInterest: z.enum(["FIND_HOUSING", "RENT"]),
  idealLocation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class CreateUserDtoRequest extends createZodDto(createUserSchema) {}

export class CreateUserDtoResponse extends createZodDto(
  createUserResponseSchema,
) {}
