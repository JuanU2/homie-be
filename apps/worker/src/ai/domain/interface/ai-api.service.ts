export interface PropertyImageInput {
  data: string;
  mimeType: string;
}

export interface AnalyzePropertyImagesRequest {
  prompt: string;
  images: PropertyImageInput[];
  jsonSchema: Record<string, unknown>;
}

export interface GenerateStructuredRequest {
  prompt: string;
  jsonSchema: Record<string, unknown>;
}

export interface GenerateStructuredWithDocumentRequest {
  prompt: string;
  jsonSchema: Record<string, unknown>;
  document: { content: string; mimeType: string };
}

export interface IAiApiService {
  analyzePropertyImages(request: AnalyzePropertyImagesRequest): Promise<string>;
  generateStructured(request: GenerateStructuredRequest): Promise<string>;
  generateStructuredWithDocument(
    request: GenerateStructuredWithDocumentRequest,
  ): Promise<string>;
  generateText(prompt: string): Promise<string>;
}

export const AI_API_SERVICE = Symbol('AI_API_SERVICE');
