export type RoommateRequestCurrency = 'EUR' | 'CZK' | 'USD';

export type RoommateRequestStatus =
  | 'ACTIVE'
  | 'RESERVED'
  | 'CLOSED'
  | 'EXPIRED';

export interface RoommateRequest {
  id: string;
  propertyId: string;
  createdBy: string;
  title: string;
  description: string;
  priceAmount: number;
  priceCurrency: RoommateRequestCurrency;
  idealMoveInDate: string | null;
  maxRoommates: number;
  currentRoommates: number;
  status: RoommateRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export interface CreateRoommateRequestModel {
  propertyId: string;
  createdBy: string;
  title: string;
  description: string;
  priceAmount: number;
  priceCurrency: RoommateRequestCurrency;
  idealMoveInDate?: string;
  maxRoommates: number;
  currentRoommates: number;
}

export interface RoommateRequestPropertySummary {
  id: string;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  lat: number;
  lng: number;
  titleImageId: string | null;
}

export interface RoommateRequestListItem {
  id: string;
  title: string;
  maxRoommates: number;
  currentRoommates: number;
  priceAmount: number;
  priceCurrency: RoommateRequestCurrency;
  property: RoommateRequestPropertySummary;
}

export interface RoommateRequestsPage {
  items: RoommateRequestListItem[];
  nextCursor: string | null;
}

export interface GetRoommateRequestsParams {
  limit: number;
  cursor?: string;
  lat?: number;
  lng?: number;
}

export interface RoommateRequestOwnerProfile {
  fullName: string;
  phoneNumber: string | null;
  profileUrl: string | null;
}

export interface RoommateRequestPropertyRoom {
  roomType: string;
  count: number;
}

export interface RoommateRequestPropertyEquipment {
  equipmentType: string;
  count: number;
}

export interface RoommateRequestPropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  title: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoommateRequestPropertyDetail {
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
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
  rooms: RoommateRequestPropertyRoom[];
  equipment: RoommateRequestPropertyEquipment[];
  images: RoommateRequestPropertyImage[];
}

export interface RoommateRequestDetail extends RoommateRequest {
  owner: RoommateRequestOwnerProfile;
  property: RoommateRequestPropertyDetail;
}
