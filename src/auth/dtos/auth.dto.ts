import z from "zod";
import { createZodDto } from "nestjs-zod";

export const authUserRequestSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.email(),
    image: z.string(),
  }),
  expires: z.string(),
  idToken: z.string(),
});

export class AuthUserDtoRequest extends createZodDto(authUserRequestSchema) {}