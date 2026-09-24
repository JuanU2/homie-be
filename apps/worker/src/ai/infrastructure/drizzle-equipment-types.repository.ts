import { Inject, Injectable } from '@nestjs/common';
import { type NodePgDatabase } from '@homie/db';
import { equipmentTypes } from '@/database/schema/index';
import * as schema from '@/database/schema/index';
import { IEquipmentTypesRepository } from '../domain/interface/equipment-types.repository';

@Injectable()
export class DrizzleEquipmentTypesRepository
  implements IEquipmentTypesRepository
{
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getNames(): Promise<string[]> {
    const rows = await this.db
      .select({ name: equipmentTypes.name })
      .from(equipmentTypes)
      .orderBy(equipmentTypes.name);

    return rows.map((row) => row.name);
  }

  async upsert(name: string): Promise<void> {
    await this.db
      .insert(equipmentTypes)
      .values({ name })
      .onConflictDoNothing({ target: equipmentTypes.name });
  }
}
