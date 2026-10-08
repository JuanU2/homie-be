import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type NodePgDatabase } from '@homie/db';
import type { PointOfInterestLocation } from '@homie/events';
import { pointsOfInterest } from '@/db/schema/index';
import * as schema from '@/db/schema/index';
import { IPointsOfInterestRepository } from '../domain/interface/points-of-interest.repository';

@Injectable()
export class DrizzlePointsOfInterestRepository
  implements IPointsOfInterestRepository
{
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async replaceForProperty(
    propertyId: string,
    points: PointOfInterestLocation[],
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(pointsOfInterest)
        .where(eq(pointsOfInterest.propertyId, propertyId));

      if (points.length > 0) {
        await tx.insert(pointsOfInterest).values(
          points.map((point) => ({
            propertyId,
            lat: point.lat,
            lng: point.lng,
            locationType: point.locationType,
          })),
        );
      }
    });
  }
}
