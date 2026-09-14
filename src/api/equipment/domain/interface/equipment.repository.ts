import {
  PatchPropertyEquipmentModel,
  PropertyEquipment,
} from '@/api/equipment/domain/entity/equipment';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface IEquipmentRepository {
  patchPropertyEquipment(
    equipment: PatchPropertyEquipmentModel,
    dbClient?: NodePgDatabase<any>,
  ): Promise<PropertyEquipment | undefined>;
}

export const EQUIPMENT_REPOSITORY = Symbol('EQUIPMENT_REPOSITORY');
