export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyImageModel {
  propertyId: string;
  imageUrl: string;
}
