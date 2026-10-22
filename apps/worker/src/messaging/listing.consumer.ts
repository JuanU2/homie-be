import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  POINTS_OF_INTEREST_EVENT_TYPE,
  POINTS_OF_INTEREST_ROUTING_KEY,
  PROPERTY_UPDATED_ROUTING_KEY,
  LISTING_CREATED_ROUTING_KEY,
  LISTING_UPDATED_ROUTING_KEY,
  propertyUpdatedEventSchema,
  listingCreatedEventSchema,
  listingUpdatedEventSchema,
} from '@homie/events';
import { LISTINGS_REPOSITORY } from '@/listings/domain/interface/listings.repository';
import type { IListingsRepository } from '@/listings/domain/interface/listings.repository';
import { PropertyInsightsService } from '@/property-insights/property-insights.service';
import type { PropertyInsightsInput } from '@/property-insights/dtos/property-insights.dto';
import { EventPublisher } from './event.publisher';

@Controller()
export class ListingConsumer {
  private readonly logger = new Logger(ListingConsumer.name);

  constructor(
    @Inject(LISTINGS_REPOSITORY)
    private readonly listingsRepository: IListingsRepository,
    private readonly propertyInsightsService: PropertyInsightsService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @EventPattern(LISTING_CREATED_ROUTING_KEY)
  async handleCreated(event: unknown): Promise<void> {
    const parsed = listingCreatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed ListingCreated event');
      return;
    }

    this.logger.log(
      `Received ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
    await this.listingsRepository.upsert(parsed.data.payload);
    await this.generateInsights(parsed.data.payload.property);
    this.logger.log(
      `Processed ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
  }

  @EventPattern(LISTING_UPDATED_ROUTING_KEY)
  async handleUpdated(event: unknown): Promise<void> {
    const parsed = listingUpdatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed ListingUpdated event');
      return;
    }

    this.logger.log(
      `Received ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
    await this.listingsRepository.upsert(parsed.data.payload);
    this.logger.log(
      `Processed ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
  }

  @EventPattern(PROPERTY_UPDATED_ROUTING_KEY)
  async handlePropertyUpdated(event: unknown): Promise<void> {
    const parsed = propertyUpdatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed PropertyUpdated event');
      return;
    }

    this.logger.log(
      `Received ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );

    const { payload } = parsed.data;
    const previousProperty =
      await this.listingsRepository.getProperty(payload.id);

    await this.listingsRepository.updateProperty(payload.id, payload);

    if (
      previousProperty &&
      this.propertyInsightsService.hasLocationChanged(previousProperty, payload)
    ) {
      await this.generateInsights(payload);
    }

    this.logger.log(
      `Processed ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
  }

  private async generateInsights(input: PropertyInsightsInput): Promise<void> {
    try {
      const points = await this.propertyInsightsService.generateForProperty(input);
      if (points.length > 0) {
        await this.eventPublisher.publish(
          POINTS_OF_INTEREST_EVENT_TYPE,
          POINTS_OF_INTEREST_ROUTING_KEY,
          { propertyId: input.id, points },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate property insights for property ${input.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
