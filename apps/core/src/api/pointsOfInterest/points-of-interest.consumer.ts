import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  POINTS_OF_INTEREST_ROUTING_KEY,
  pointsOfInterestEventSchema,
} from '@homie/events';
import {
  POINTS_OF_INTEREST_REPOSITORY,
  type IPointsOfInterestRepository,
} from './domain/interface/points-of-interest.repository';

@Controller()
export class PointsOfInterestConsumer {
  private readonly logger = new Logger(PointsOfInterestConsumer.name);

  constructor(
    @Inject(POINTS_OF_INTEREST_REPOSITORY)
    private readonly pointsOfInterestRepository: IPointsOfInterestRepository,
  ) {}

  @EventPattern(POINTS_OF_INTEREST_ROUTING_KEY)
  async handlePointsOfInterest(event: unknown): Promise<void> {
    const parsed = pointsOfInterestEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed PointsOfInterestUpdated event');
      return;
    }

    this.logger.log(
      `Received ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
    await this.pointsOfInterestRepository.replaceForProperty(
      parsed.data.payload.propertyId,
      parsed.data.payload.points,
    );
    this.logger.log(
      `Processed ${parsed.data.eventType} event ${parsed.data.eventId}`,
    );
  }
}
