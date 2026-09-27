import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import {
  propertyAnalysisResultSchema,
  scrapeListingResultSchema,
  type PropertyAnalysisResult,
  type PropertyLocation,
  type ScrapeListingResult,
} from './dtos/ai.dto';
import {
  buildPropertyAnalysisJsonSchema,
  buildPropertyAnalysisPrompt,
} from './property-analysis.prompt';
import {
  buildScrapeListingJsonSchema,
  buildScrapeListingPrompt,
} from './scrape-listing.prompt';
import {
  AI_API_SERVICE,
  type IAiApiService,
  type PropertyImageInput,
} from './domain/interface/ai-api.service';
import { parseModelJson } from './infrastructure/parse-model-json';
import {
  EQUIPMENT_TYPES_REPOSITORY,
  type IEquipmentTypesRepository,
} from './domain/interface/equipment-types.repository';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

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

    const json = parseModelJson(raw);

    return propertyAnalysisResultSchema.parse(json);
  }

  async scrapeListing(url: string): Promise<ScrapeListingResult> {
    const html = await this.fetchListingHtml(url);
    const equipmentTypeNames = await this.equipmentTypesRepository.getNames();

    const prompt = buildScrapeListingPrompt({ equipmentTypeNames });
    const jsonSchema = buildScrapeListingJsonSchema({ equipmentTypeNames });

    const raw = await this.aiApi.generateStructuredWithDocument({
      prompt,
      jsonSchema,
      document: { content: html, mimeType: 'text/plain' },
    });
    const json = parseModelJson(raw);
    const result = scrapeListingResultSchema.parse(json);

    if (
      result.property &&
      (result.property.lat === undefined) !==
        (result.property.lng === undefined)
    ) {
      delete result.property.lat;
      delete result.property.lng;
    }

    return result;
  }

  private async fetchListingHtml(url: string): Promise<string> {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException('Only http and https URLs are supported');
    }

    try {
      const response = await fetch(parsed.toString(), {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HomieBot/1.0)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new BadRequestException(
          `Failed to fetch the listing URL (HTTP ${response.status})`,
        );
      }

      const html = await response.text();
      this.logger.log(
        `Fetched listing HTML: ${html.length}`,
      );
      return html;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn(
        `Failed to scrape listing URL: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Could not fetch the provided URL');
    }
  }
}
