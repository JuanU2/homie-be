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

@Controller()
export class RoommateRequestConsumer {
  private readonly logger = new Logger(RoommateRequestConsumer.name);

  constructor(
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
  ) {}

  @EventPattern(ROOMMATE_REQUEST_CREATED_ROUTING_KEY)
  async handleCreated(event: unknown): Promise<void> {
    const parsed = roommateRequestCreatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed RoommateRequestCreated event');
      return;
    }

    await this.roommateRequestsRepository.upsert(parsed.data.payload);
  }

  @EventPattern(ROOMMATE_REQUEST_UPDATED_ROUTING_KEY)
  async handleUpdated(event: unknown): Promise<void> {
    const parsed = roommateRequestUpdatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed RoommateRequestUpdated event');
      return;
    }

    await this.roommateRequestsRepository.upsert(parsed.data.payload);
  }

  @EventPattern(PROPERTY_UPDATED_ROUTING_KEY)
  async handlePropertyUpdated(event: unknown): Promise<void> {
    const parsed = propertyUpdatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed PropertyUpdated event');
      return;
    }

    await this.roommateRequestsRepository.updateProperty(
      parsed.data.payload.id,
      parsed.data.payload,
    );
  }
}
