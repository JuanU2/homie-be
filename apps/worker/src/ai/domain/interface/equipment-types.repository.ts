export interface IEquipmentTypesRepository {
  getNames(): Promise<string[]>;
}

export const EQUIPMENT_TYPES_REPOSITORY = Symbol('EQUIPMENT_TYPES_REPOSITORY');
