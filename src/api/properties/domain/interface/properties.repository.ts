import {
  CreatePropertyModel,
  CreatedPropertyAggregate,
} from '@/api/properties/domain/entity/property';

export interface IPropertiesRepository {
  createProperty(property: CreatePropertyModel): Promise<CreatedPropertyAggregate>;
}

export const PROPERTIES_REPOSITORY = Symbol("PROPERTIES_REPOSITORY");