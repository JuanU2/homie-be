import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai?: GoogleGenAI;
  private readonly model: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('GEMINI_API_KEY');
    this.model = config.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set — AI requests will fail.');
      return;
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    return response.text ?? '';
  }
}
