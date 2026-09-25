import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  PROPERTY_UPDATED_ROUTING_KEY,
  ROOMMATE_REQUEST_CREATED_ROUTING_KEY,
  ROOMMATE_REQUEST_UPDATED_ROUTING_KEY,
  propertyUpdatedEventSchema,
  roommateRequestCreatedEventSchema,
  roommateRequestUpdatedEventSchema,
} from '@homie/events';
import { ROOMMATE_REQUESTS_REPOSITORY } from '@/roommate-requests/domain/interface/roommate-requests.repository';
import type { IRoommateRequestsRepository } from '@/roommate-requests/domain/interface/roommate-requests.repository';
import { PropertyInsightsService } from '@/property-insights/property-insights.service';
import type { PropertyInsightsInput } from '@/property-insights/dtos/property-insights.dto';

@Controller()
export class RoommateRequestConsumer {
  private readonly logger = new Logger(RoommateRequestConsumer.name);

  constructor(
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
    private readonly propertyInsightsService: PropertyInsightsService,
  ) {}

  @EventPattern(ROOMMATE_REQUEST_CREATED_ROUTING_KEY)
  async handleCreated(event: unknown): Promise<void> {
    const parsed = roommateRequestCreatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed RoommateRequestCreated event');
      return;
    }

    this.logger.log(
      `Received ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
    await this.roommateRequestsRepository.upsert(parsed.data.payload);
    await this.generateInsights(parsed.data.payload.property);
    this.logger.log(
      `Processed ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
  }

  @EventPattern(ROOMMATE_REQUEST_UPDATED_ROUTING_KEY)
  async handleUpdated(event: unknown): Promise<void> {
    const parsed = roommateRequestUpdatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed RoommateRequestUpdated event');
      return;
    }

    this.logger.log(
      `Received ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
    await this.roommateRequestsRepository.upsert(parsed.data.payload);
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
      await this.roommateRequestsRepository.getProperty(payload.id);

    await this.roommateRequestsRepository.updateProperty(payload.id, payload);

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
      await this.propertyInsightsService.generateForProperty(input);
    } catch (error) {
      this.logger.error(
        `Failed to generate property insights for property ${input.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
