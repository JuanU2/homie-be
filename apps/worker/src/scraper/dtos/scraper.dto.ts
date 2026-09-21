import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const scrapeSchema = z.object({
  url: z.url(),
  selector: z.string().optional(),
});

export class ScrapeDto extends createZodDto(scrapeSchema) {}
