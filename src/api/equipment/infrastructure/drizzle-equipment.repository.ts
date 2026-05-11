import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { equipmentTypes, propertyEquipment } from '@/db/schema';
import * as schema from '@/db/schema';
import {
  CreatePropertyEquipmentModel,
  PatchPropertyEquipmentModel,
  PropertyEquipment,
} from '@/api/equipment/domain/entity/equipment';
import { IEquipmentRepository } from '@/api/equipment/domain/interface/equipment.repository';

@Injectable()
export class DrizzleEquipmentRepository implements IEquipmentRepository {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private async getOrCreateEquipmentTypeId(
    name: string,
    dbClient?: NodePgDatabase<typeof schema>,
  ): Promise<string> {
    const client = dbClient ?? this.db;

    const [existingType] = await client
      .select()
      .from(equipmentTypes)
      .where(eq(equipmentTypes.name, name))
      .limit(1);

    if (existingType) {
      return existingType.id;
    }

    const [createdType] = await client
      .insert(equipmentTypes)
      .values({ name })
      .returning();

    if (!createdType) {
      throw new Error('Failed to create equipment type');
    }

    return createdType.id;
  }

  async createPropertyEquipment(
    equipment: CreatePropertyEquipmentModel,
    dbClient?: NodePgDatabase<typeof schema>,
  ): Promise<PropertyEquipment> {
    const client = dbClient ?? this.db;

    const equipmentTypeId = await this.getOrCreateEquipmentTypeId(
      equipment.equipmentType,
      client,
    );

    const [createdEquipment] = await client
      .insert(propertyEquipment)
      .values({
        propertyId: equipment.propertyId,
        equipmentTypeId,
        quantity: equipment.count,
      })
      .onConflictDoUpdate({
        target: [propertyEquipment.propertyId, propertyEquipment.equipmentTypeId],
        set: { quantity: equipment.count },
      })
      .returning();

    if (!createdEquipment) {
      throw new Error('Failed to create property equipment');
    }

    return {
      propertyId: createdEquipment.propertyId,
      equipmentType: equipment.equipmentType,
      count: createdEquipment.quantity,
    };
  }

  async patchPropertyEquipment(
    equipment: PatchPropertyEquipmentModel,
    dbClient?: NodePgDatabase<typeof schema>,
  ): Promise<PropertyEquipment | undefined> {
    const client = dbClient ?? this.db;

    const [equipmentType] = await client
      .select()
      .from(equipmentTypes)
      .where(eq(equipmentTypes.name, equipment.equipmentType))
      .limit(1);

    if (!equipmentType) {
      return undefined;
    }

    const [updatedEquipment] = await client
      .update(propertyEquipment)
      .set({ quantity: equipment.count })
      .where(
        and(
          eq(propertyEquipment.propertyId, equipment.propertyId),
          eq(propertyEquipment.equipmentTypeId, equipmentType.id),
        ),
      )
      .returning();

    if (!updatedEquipment) {
      return undefined;
    }

    return {
      propertyId: updatedEquipment.propertyId,
      equipmentType: equipment.equipmentType,
      count: updatedEquipment.quantity,
    };
  }
}
