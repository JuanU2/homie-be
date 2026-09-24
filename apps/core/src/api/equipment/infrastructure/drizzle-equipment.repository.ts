import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { equipmentTypes, propertyEquipment } from '@/db/schema/index';
import * as schema from '@/db/schema/index';
import {
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
