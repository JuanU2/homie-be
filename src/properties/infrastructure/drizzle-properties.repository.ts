import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IPropertiesRepository } from '@/properties/domain/interface/properties.repository';
import { CreatePropertyModel, Property } from '@/properties/domain/entity/property';
import { properties } from '@/db/schema';

type PropertySchema = { properties: typeof properties };

@Injectable()
export class PropertiesRepository implements IPropertiesRepository {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<PropertySchema>,
  ) {}

  async createProperty(property: CreatePropertyModel): Promise<Property> {
    const [createdProperty] = await this.db
      .insert(properties)
      .values({
        ownerId: property.ownerId,
        description: property.description,
        sizeM2: property.sizeM2 ?? null,
        roomCount: property.roomCount,
        country: property.country,
        city: property.city,
        zipCode: String(property.zipCode),
        street: property.street,
        streetNumber: String(property.streetNumber),
        location: property.location,
      })
      .returning();

    if (!createdProperty) {
      throw new Error("Failed to create property");
    }

    return createdProperty;
  }
}