import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { equipmentTypes } from '@/db/schema';
import * as schema from '@/db/schema';
import { EquipmentType } from '../domain/entity/equipmentType';
import { IEquipmentTypesRepository } from '../domain/interface/equipmentTypes.repository';

@Injectable()
export class DrizzleEquipmentTypesRepository
  implements IEquipmentTypesRepository
{
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getAll(): Promise<EquipmentType[]> {
    return this.db.select().from(equipmentTypes).orderBy(equipmentTypes.name);
  }
}
