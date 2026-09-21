import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const aiGenerateSchema = z.object({
  prompt: z.string().min(1),
});

export class AiGenerateDto extends createZodDto(aiGenerateSchema) {}
