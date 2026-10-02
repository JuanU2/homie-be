import type {
  PropertyData,
  PropertyUpdatedPayload,
  RoommateRequestBlob,
} from '@homie/events';

export interface IRoommateRequestsRepository {
  upsert(data: RoommateRequestBlob): Promise<void>;
  updateProperty(
    propertyId: string,
    property: PropertyUpdatedPayload,
  ): Promise<void>;
  getProperty(propertyId: string): Promise<PropertyData | null>;
  findById(id: string): Promise<RoommateRequestBlob | null>;
}

export const ROOMMATE_REQUESTS_REPOSITORY = Symbol(
  'ROOMMATE_REQUESTS_REPOSITORY',
);
