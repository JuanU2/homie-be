export interface Property {
  id: string;
  ownerId: string;
  description: string;
  sizeM2: number | null;
  roomCount: number;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyRoomModel {
  roomType: 'DORMITORY' | 'BATHROOM' | 'KITCHEN' | 'LIVING_ROOM' | 'TOILET' | 'WARDROBE' | 'BALCONY' | 'OTHER';
  count: number;
}

export interface CreatePropertyEquipmentModel {
  equipmentType: string;
  count: number;
}

export interface CreatePropertyModel {
  ownerId: string;
  description: string;
  sizeM2?: number;
  roomCount: number;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  lat: number;
  lng: number;
  rooms: CreatePropertyRoomModel[];
  equipment: CreatePropertyEquipmentModel[];
}

export interface CreatedPropertyAggregate {
  property: Property;
  rooms: CreatePropertyRoomModel[];
  equipment: CreatePropertyEquipmentModel[];
}
