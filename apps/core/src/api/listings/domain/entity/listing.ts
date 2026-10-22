import type { RoommateApplicationWithApplicant } from '@/api/roommateApplications/domain/entity/roommateApplication';
import type { ListingSortBy } from '@/api/listings/domain/ranking';

export type ListingCurrency = 'EUR' | 'CZK' | 'USD';

export type ListingStatus =
  | 'ACTIVE'
  | 'RESERVED'
  | 'CLOSED'
  | 'EXPIRED';

export type RoommatePreferredGender = 'MALE' | 'FEMALE' | 'ALL';

export interface Listing {
  id: string;
  propertyId: string;
  createdBy: string;
  title: string;
  description: string;
  priceAmount: number;
  priceCurrency: ListingCurrency;
  idealMoveInDate: string | null;
  maxRoommates: number;
  currentRoommates: number;
  status: ListingStatus;
  preferredGender: RoommatePreferredGender;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export interface CreateListingModel {
  propertyId: string;
  createdBy: string;
  title: string;
  description: string;
  priceAmount: number;
  priceCurrency: ListingCurrency;
  idealMoveInDate?: string;
  maxRoommates: number;
  currentRoommates: number;
  preferredGender: RoommatePreferredGender;
}

export interface UpdateListingModel {
  title: string;
  description: string;
  priceAmount: number;
  priceCurrency: ListingCurrency;
  idealMoveInDate?: string;
  maxRoommates: number;
  currentRoommates: number;
  preferredGender: RoommatePreferredGender;
}

export interface UpdateListingStatusModel {
  status: ListingStatus;
  maxRoommates?: number;
  currentRoommates?: number;
  closedAt?: Date | null;
}

export interface ListingPropertySummary {
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

export interface ListingListItem {
  id: string;
  title: string;
  maxRoommates: number;
  currentRoommates: number;
  priceAmount: number;
  priceCurrency: ListingCurrency;
  property: ListingPropertySummary;
}

export interface ListingsPage {
  items: ListingListItem[];
  nextCursor: string | null;
}

export interface GetListingsParams {
  limit: number;
  cursor?: string;
  lat?: number;
  lng?: number;
  priceFrom?: number;
  priceTo?: number;
  equipment?: string[];
  rooms?: string[];
  sortBy?: ListingSortBy[];
  preferredGender?: RoommatePreferredGender;
}

export interface UserListingListItem
  extends ListingListItem {
  status: ListingStatus;
  pendingApplicationsCount: number;
}

export interface UserListingsPage {
  items: UserListingListItem[];
  nextCursor: string | null;
}

export interface GetUserListingsParams {
  limit: number;
  cursor?: string;
  status?: ListingStatus;
}

export interface ListingOwnerProfile {
  fullName: string;
  phoneNumber: string | null;
  profileUrl: string | null;
}

export interface ListingPropertyRoom {
  roomType: string;
  count: number;
}

export interface ListingPropertyEquipment {
  equipmentType: string;
  count: number;
}

export interface ListingPropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  title: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingPropertyDetail {
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
  rooms: ListingPropertyRoom[];
  equipment: ListingPropertyEquipment[];
  images: ListingPropertyImage[];
}

export interface ListingDetail extends Listing {
  owner: ListingOwnerProfile;
  property: ListingPropertyDetail;
}

export interface UserListingDetail extends ListingDetail {
  applications: RoommateApplicationWithApplicant[];
}
