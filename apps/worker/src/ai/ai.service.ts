import { Inject, Injectable } from '@nestjs/common';
import {
  propertyAnalysisResultSchema,
  type PropertyAnalysisResult,
  type PropertyLocation,
} from './dtos/ai.dto';
import {
  buildPropertyAnalysisJsonSchema,
  buildPropertyAnalysisPrompt,
} from './property-analysis.prompt';
import {
  AI_API_SERVICE,
  type IAiApiService,
  type PropertyImageInput,
} from './domain/interface/ai-api.service';
import {
  EQUIPMENT_TYPES_REPOSITORY,
  type IEquipmentTypesRepository,
} from './domain/interface/equipment-types.repository';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_API_SERVICE) private readonly aiApi: IAiApiService,
    @Inject(EQUIPMENT_TYPES_REPOSITORY)
    private readonly equipmentTypesRepository: IEquipmentTypesRepository,
  ) {}

  async analyzePropertyImages(
    images: PropertyImageInput[],
    language?: string,
    location?: PropertyLocation,
  ): Promise<PropertyAnalysisResult> {
    const equipmentTypeNames = await this.equipmentTypesRepository.getNames();
    const prompt = buildPropertyAnalysisPrompt({
      language,
      equipmentTypeNames,
      location,
    });
    const jsonSchema = buildPropertyAnalysisJsonSchema({ equipmentTypeNames });

    const raw = await this.aiApi.analyzePropertyImages({
      prompt,
      images,
      jsonSchema,
    });

    const json = JSON.parse(
      raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''),
    );

    return propertyAnalysisResultSchema.parse(json);
  }
}
