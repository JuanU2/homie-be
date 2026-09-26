import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AI_API_SERVICE,
  type IAiApiService,
} from '@/ai/domain/interface/ai-api.service';
import { parseModelJson } from '@/ai/infrastructure/parse-model-json';
import {
  propertyInsightsAiSchema,
  type PropertyInsights,
  type PropertyInsightsInput,
  type PropertyLocation,
} from './dtos/property-insights.dto';
import {
  buildPropertyInsightsJsonSchema,
  buildPropertyInsightsPrompt,
} from './property-insights.prompt';
import { PROPERTY_INSIGHTS_REPOSITORY } from './domain/interface/property-insights.repository';
import type { IPropertyInsightsRepository } from './domain/interface/property-insights.repository';
import { GeocodingService } from '@/geocoding/geocoding.service';

@Injectable()
export class PropertyInsightsService {
  private readonly logger = new Logger(PropertyInsightsService.name);

  constructor(
    @Inject(AI_API_SERVICE) private readonly aiApi: IAiApiService,
    @Inject(PROPERTY_INSIGHTS_REPOSITORY)
    private readonly propertyInsightsRepository: IPropertyInsightsRepository,
    private readonly geocodingService: GeocodingService,
  ) {}

  async generateForProperty(input: PropertyInsightsInput): Promise<void> {
    const prompt = buildPropertyInsightsPrompt(input);
    const jsonSchema = buildPropertyInsightsJsonSchema();

    const raw = await this.aiApi.generateStructured({ prompt, jsonSchema });
    const aiResponse = propertyInsightsAiSchema.parse(parseModelJson(raw));

    const insight: PropertyInsights = {
      advantages: aiResponse.advantages,
      nearbyPlaces: await Promise.all(
        aiResponse.nearbyPlaces.map(async (place) => ({
          placeCategory: place.placeCategory,
          location:
            (await this.geocodingService.search(place.fulltextSearchTerm)) ??
            place.location,
          name: place.name,
          distance: place.distance,
        })),
      ),
    };

    await this.propertyInsightsRepository.upsert(input.id, insight);
    this.logger.log(`Generated property insights for property ${input.id}`);
  }

  async getForProperty(propertyId: string): Promise<PropertyInsights> {
    const insight = await this.propertyInsightsRepository.get(propertyId);
    if (!insight) {
      throw new NotFoundException('Property insights not found');
    }
    return insight;
  }

  hasLocationChanged(
    previous: PropertyLocation,
    next: PropertyLocation,
  ): boolean {
    return (
      previous.country !== next.country ||
      previous.city !== next.city ||
      previous.zipCode !== next.zipCode ||
      previous.street !== next.street ||
      previous.streetNumber !== next.streetNumber
    );
  }
}
