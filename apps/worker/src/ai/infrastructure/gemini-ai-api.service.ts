import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  type AnalyzePropertyImagesRequest,
  type GenerateStructuredRequest,
  type GenerateStructuredWithDocumentRequest,
  type IAiApiService,
  type PropertyImageInput,
} from '../domain/interface/ai-api.service';
import { ContentType } from './content-type';

const DEFAULT_MODEL = 'gemini-3.8-flash';
const REQUEST_TIMEOUT_MS = 120_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Gemini request timed out after ${ms / 1000}s`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

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
    return this.generateJson({
      prompt: `You are given ${images.length} photograph(s) of a single property.\n\n${prompt}`,
      jsonSchema,
      images,
    });
  }

  async generateStructured({
    prompt,
    jsonSchema,
  }: GenerateStructuredRequest): Promise<string> {
    return this.generateJson({ prompt, jsonSchema });
  }

  async generateStructuredWithDocument({
    prompt,
    jsonSchema,
    document,
  }: GenerateStructuredWithDocumentRequest): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const file = await this.ai.files.upload({
      file: new Blob([document.content], { type: document.mimeType }),
      config: { mimeType: document.mimeType, displayName: 'listing.html' },
    });

    if (!file.uri) {
      throw new Error('Gemini did not return a file URI for the listing');
    }

    return this.generateJson({
      prompt,
      jsonSchema,
      documents: [{ uri: file.uri, mimeType: document.mimeType }],
    });
  }

  private async generateJson({
    prompt,
    jsonSchema,
    images,
    documents,
  }: {
    prompt: string;
    jsonSchema: Record<string, unknown>;
    images?: PropertyImageInput[];
    documents?: Array<{ uri: string; mimeType: string }>;
  }): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const input = [
      { type: ContentType.TEXT, text: prompt },
      ...(images ?? []).map((image) => ({
        type: ContentType.IMAGE,
        data: image.data,
        mime_type: image.mimeType,
      })),
      ...(documents ?? []).map((document) => ({
        type: ContentType.DOCUMENT,
        uri: document.uri,
        mime_type: document.mimeType,
      })),
    ];

    const interaction = await withTimeout(
      this.ai.interactions.create({
        model: this.model,
        input,
        response_format: {
          type: ContentType.TEXT,
          mime_type: 'application/json',
          schema: jsonSchema,
        },
      }),
      REQUEST_TIMEOUT_MS,
    );

    const raw = interaction.output_text;
    if (!raw) {
      throw new Error('Gemini returned no structured output');
    }

    return raw;
  }
}
