export interface IEquipmentTypesRepository {
  getNames(): Promise<string[]>;
  upsert(name: string): Promise<void>;
}

export const EQUIPMENT_TYPES_REPOSITORY = Symbol('EQUIPMENT_TYPES_REPOSITORY');
