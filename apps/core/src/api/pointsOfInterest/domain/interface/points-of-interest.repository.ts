import type { PointOfInterestLocation } from '@homie/events';

export interface IPointsOfInterestRepository {
  replaceForProperty(
    propertyId: string,
    points: PointOfInterestLocation[],
  ): Promise<void>;
}

export const POINTS_OF_INTEREST_REPOSITORY = Symbol(
  'POINTS_OF_INTEREST_REPOSITORY',
);
