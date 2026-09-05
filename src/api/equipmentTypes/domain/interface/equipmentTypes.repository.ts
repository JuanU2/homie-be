import { EquipmentType } from '../entity/equipmentType';

export interface IEquipmentTypesRepository {
  getAll(): Promise<EquipmentType[]>;
}

export const EQUIPMENT_TYPES_REPOSITORY = Symbol('EQUIPMENT_TYPES_REPOSITORY');
