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

export interface CreatePropertyModel {
  ownerId: string;
  description: string;
  sizeM2?: number;
  roomCount: number;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: number;
  location: string;
}
