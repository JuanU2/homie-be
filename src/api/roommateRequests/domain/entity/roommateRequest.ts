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
