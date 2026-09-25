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

export interface IAiApiService {
  analyzePropertyImages(request: AnalyzePropertyImagesRequest): Promise<string>;
  generateStructured(request: GenerateStructuredRequest): Promise<string>;
}

export const AI_API_SERVICE = Symbol('AI_API_SERVICE');
