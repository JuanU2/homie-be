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
import type { PointOfInterestLocation } from '@homie/events';
import { parseModelJson } from '@/ai/infrastructure/parse-model-json';
import {
  propertyInsightsAiSchema,
  type PropertyInsights,
  type PropertyInsightsAiResponse,
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

  async generateForProperty(
    input: PropertyInsightsInput,
  ): Promise<PointOfInterestLocation[]> {
    const prompt = buildPropertyInsightsPrompt(input);
    const jsonSchema = buildPropertyInsightsJsonSchema();

    const aiResponse = await this.generateValidatedInsights(prompt, jsonSchema);

    const nearbyPlaces = await Promise.all(
      aiResponse.nearbyPlaces.map(async (place) => ({
        placeCategory: place.placeCategory,
        location:
          (await this.geocodingService.search(place.fulltextSearchTerm)) ??
          place.location,
        name: place.name,
        distance: place.distance,
      })),
    );

    const insight: PropertyInsights = {
      advantages: aiResponse.advantages,
      nearbyPlaces,
    };

    await this.propertyInsightsRepository.upsert(input.id, insight);
    this.logger.log(`Generated property insights for property ${input.id}`);

    return this.extractPointsOfInterest(nearbyPlaces);
  }

  private extractPointsOfInterest(
    nearbyPlaces: PropertyInsights['nearbyPlaces'],
  ): PointOfInterestLocation[] {
    const points: PointOfInterestLocation[] = [];

    for (const place of nearbyPlaces) {
      if (
        place.placeCategory === 'CITY_CENTER' ||
        place.placeCategory === 'PUBLIC_TRANSPORT'
      ) {
        points.push({
          lat: place.location.lat,
          lng: place.location.lng,
          locationType: place.placeCategory,
        });
      }
    }

    return points;
  }

  private static readonly REQUIRED_PLACE_CATEGORIES = [
    'CITY_CENTER',
    'PUBLIC_TRANSPORT',
  ] as const;

  private async generateValidatedInsights(
    prompt: string,
    jsonSchema: ReturnType<typeof buildPropertyInsightsJsonSchema>,
  ): Promise<PropertyInsightsAiResponse> {
    const maxAttempts = 2;
    let missingCategories: readonly string[] = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const raw = await this.aiApi.generateStructured({ prompt, jsonSchema });
      const aiResponse = propertyInsightsAiSchema.parse(parseModelJson(raw));

      missingCategories = PropertyInsightsService.REQUIRED_PLACE_CATEGORIES.filter(
        (category) =>
          !aiResponse.nearbyPlaces.some((p) => p.placeCategory === category),
      );

      if (missingCategories.length === 0) {
        return aiResponse;
      }

      this.logger.warn(
        `Property insights missing required place categories (attempt ${attempt}/${maxAttempts}): ${missingCategories.join(', ')}`,
      );
    }

    throw new Error(
      `Property insights missing required place categories after ${maxAttempts} attempts: ${missingCategories.join(', ')}`,
    );
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
