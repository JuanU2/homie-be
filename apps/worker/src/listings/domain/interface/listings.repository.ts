import type {
  PropertyData,
  PropertyUpdatedPayload,
  ListingBlob,
} from '@homie/events';

export interface IListingsRepository {
  upsert(data: ListingBlob): Promise<void>;
  updateProperty(
    propertyId: string,
    property: PropertyUpdatedPayload,
  ): Promise<void>;
  getProperty(propertyId: string): Promise<PropertyData | null>;
  findById(id: string): Promise<ListingBlob | null>;
}

export const LISTINGS_REPOSITORY = Symbol(
  'LISTINGS_REPOSITORY',
);
