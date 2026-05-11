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
  description: string;
  priceAmount: number;
  priceCurrency: RoommateRequestCurrency;
  idealMoveInDate?: string;
  maxRoommates: number;
  currentRoommates: number;
}
