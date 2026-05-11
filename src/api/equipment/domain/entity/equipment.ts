export interface PropertyEquipment {
  propertyId: string;
  equipmentType: string;
  count: number;
}

export interface CreatePropertyEquipmentModel {
  propertyId: string;
  equipmentType: string;
  count: number;
}

export interface PatchPropertyEquipmentModel {
  propertyId: string;
  equipmentType: string;
  count: number;
}
