import type {
  PropertyUpdatedPayload,
  RoommateRequestBlob,
} from '@homie/events';

export interface IRoommateRequestsRepository {
  upsert(data: RoommateRequestBlob): Promise<void>;
  updateProperty(
    propertyId: string,
    property: PropertyUpdatedPayload,
  ): Promise<void>;
}

export const ROOMMATE_REQUESTS_REPOSITORY = Symbol(
  'ROOMMATE_REQUESTS_REPOSITORY',
);
