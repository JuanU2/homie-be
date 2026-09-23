import { Inject, Injectable } from '@nestjs/common';
import { equipmentTypes, type Database } from '@homie/db';
import { IEquipmentTypesRepository } from '../domain/interface/equipment-types.repository';

@Injectable()
export class DrizzleEquipmentTypesRepository
  implements IEquipmentTypesRepository
{
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: Database,
  ) {}

  async getNames(): Promise<string[]> {
    const rows = await this.db
      .select({ name: equipmentTypes.name })
      .from(equipmentTypes)
      .orderBy(equipmentTypes.name);

    return rows.map((row) => row.name);
  }
}
