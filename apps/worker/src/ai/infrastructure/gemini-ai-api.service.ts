import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  type AnalyzePropertyImagesRequest,
  type IAiApiService,
} from '../domain/interface/ai-api.service';
import { ContentType } from './content-type';

const DEFAULT_MODEL = 'gemini-3.8-flash';

@Injectable()
export class GeminiAiApiService implements IAiApiService {
  private readonly logger = new Logger(GeminiAiApiService.name);
  private readonly model: string;

  constructor(
    @Inject('GOOGLE_GEN_AI') private readonly ai: GoogleGenAI | undefined,
    config: ConfigService,
  ) {
    this.model = config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL;

    if (!this.ai) {
      this.logger.warn('GEMINI_API_KEY is not set — AI requests will fail.');
    }
  }

  async analyzePropertyImages({
    prompt,
    images,
    jsonSchema,
  }: AnalyzePropertyImagesRequest): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const input = [
      {
        type: ContentType.TEXT,
        text: `You are given ${images.length} photograph(s) of a single property.\n\n${prompt}`,
      },
      ...images.map((image) => ({
        type: ContentType.IMAGE,
        data: image.data,
        mime_type: image.mimeType,
      })),
    ];

    const interaction = await this.ai.interactions.create({
      model: this.model,
      input,
      response_format: {
        type: ContentType.TEXT,
        mime_type: 'application/json',
        schema: jsonSchema,
      },
    });

    const raw = interaction.output_text;
    if (!raw) {
      throw new Error('Gemini returned no structured output');
    }

    return raw;
  }
}
