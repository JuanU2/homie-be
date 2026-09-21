import {
  CreatePropertyModel,
  CreatedPropertyAggregate,
  UpdatePropertyModel,
} from '@/api/properties/domain/entity/property';

export interface IPropertiesRepository {
  createProperty(property: CreatePropertyModel): Promise<CreatedPropertyAggregate>;
  updateProperty(
    propertyId: string,
    property: UpdatePropertyModel,
  ): Promise<CreatedPropertyAggregate | undefined>;
  getOwnerId(propertyId: string): Promise<string | undefined>;
}

export const PROPERTIES_REPOSITORY = Symbol("PROPERTIES_REPOSITORY");