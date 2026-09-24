import { EquipmentType } from '../entity/equipmentType';

export interface IEquipmentTypesRepository {
  getAll(): Promise<EquipmentType[]>;
  create(name: string): Promise<EquipmentType>;
}

export const EQUIPMENT_TYPES_REPOSITORY = Symbol('EQUIPMENT_TYPES_REPOSITORY');
