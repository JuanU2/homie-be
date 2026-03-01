import { CreatePropertyModel, Property } from '@/properties/domain/entity/property';

export interface IPropertiesRepository {
  createProperty(property: CreatePropertyModel): Promise<Property>;
}

export const PROPERTIES_REPOSITORY = Symbol("PROPERTIES_REPOSITORY");