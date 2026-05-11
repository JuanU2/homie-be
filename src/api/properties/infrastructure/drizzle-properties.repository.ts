import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IPropertiesRepository } from '@/api/properties/domain/interface/properties.repository';
import {
  CreatePropertyModel,
  CreatedPropertyAggregate,
} from '@/api/properties/domain/entity/property';
import { equipmentTypes, properties, propertyEquipment, propertyRooms } from '@/db/schema';
import * as schema from '@/db/schema';

@Injectable()
export class PropertiesRepository implements IPropertiesRepository {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private async getOrCreateEquipmentTypeId(
    transaction: Parameters<NodePgDatabase<typeof schema>['transaction']>[0] extends (
      tx: infer T,
    ) => any
      ? T
      : never,
    name: string,
  ): Promise<string> {
    const [existingType] = await transaction
      .select({ id: equipmentTypes.id })
      .from(equipmentTypes)
      .where(eq(equipmentTypes.name, name))
      .limit(1);

    if (existingType) {
      return existingType.id;
    }

    const [createdType] = await transaction
      .insert(equipmentTypes)
      .values({ name })
      .onConflictDoNothing({ target: equipmentTypes.name })
      .returning({ id: equipmentTypes.id });

    if (createdType) {
      return createdType.id;
    }

    const [resolvedType] = await transaction
      .select({ id: equipmentTypes.id })
      .from(equipmentTypes)
      .where(eq(equipmentTypes.name, name))
      .limit(1);

    if (!resolvedType) {
      throw new Error('Failed to resolve equipment type');
    }

    return resolvedType.id;
  }

  async createProperty(property: CreatePropertyModel): Promise<CreatedPropertyAggregate> {
    return this.db.transaction(async transaction => {
      const [createdProperty] = await transaction
        .insert(properties)
        .values({
          ownerId: property.ownerId,
          description: property.description,
          sizeM2: property.sizeM2 ?? null,
          roomCount: property.roomCount,
          country: property.country,
          city: property.city,
          zipCode: property.zipCode,
          street: property.street,
          streetNumber: property.streetNumber,
          location: `SRID=4326;POINT(${property.lng} ${property.lat})`,
        })
        .returning();

      if (!createdProperty) {
        throw new Error('Failed to create property');
      }

      if (property.rooms.length > 0) {
        await transaction.insert(propertyRooms).values(
          property.rooms.map(room => ({
            propertyId: createdProperty.id,
            roomType: room.roomType,
            count: room.count,
          })),
        );
      }

      for (const equipment of property.equipment) {
        const equipmentTypeId = await this.getOrCreateEquipmentTypeId(
          transaction,
          equipment.equipmentType,
        );

        await transaction
          .insert(propertyEquipment)
          .values({
            propertyId: createdProperty.id,
            equipmentTypeId,
            quantity: equipment.count,
          })
          .onConflictDoUpdate({
            target: [propertyEquipment.propertyId, propertyEquipment.equipmentTypeId],
            set: { quantity: equipment.count },
          });
      }

      return {
        property: createdProperty,
        rooms: property.rooms,
        equipment: property.equipment,
      };
    });
  }
}