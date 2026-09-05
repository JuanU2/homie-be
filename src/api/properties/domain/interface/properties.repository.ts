import {
  CreatePropertyModel,
  CreatedPropertyAggregate,
} from '@/api/properties/domain/entity/property';

export interface IPropertiesRepository {
  createProperty(property: CreatePropertyModel): Promise<CreatedPropertyAggregate>;
  getOwnerId(propertyId: string): Promise<string | undefined>;
}

export const PROPERTIES_REPOSITORY = Symbol("PROPERTIES_REPOSITORY");