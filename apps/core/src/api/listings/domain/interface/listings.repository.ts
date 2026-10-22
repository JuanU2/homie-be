import {
  CreateListingModel,
  GetListingsParams,
  GetUserListingsParams,
  Listing,
  ListingDetail,
  ListingsPage,
  UpdateListingModel,
  UpdateListingStatusModel,
  UserListingDetail,
  UserListingsPage,
} from '@/api/listings/domain/entity/listing';

export interface IListingsRepository {
  createListing(
    request: CreateListingModel,
  ): Promise<Listing>;
  updateListing(
    id: string,
    request: UpdateListingModel,
  ): Promise<Listing | undefined>;
  updateListingStatus(
    id: string,
    updates: UpdateListingStatusModel,
  ): Promise<Listing | undefined>;
  getListingById(id: string): Promise<Listing | undefined>;
  getListingDetail(
    id: string,
  ): Promise<ListingDetail | undefined>;
  getUserListingDetail(
    userId: string,
    listingId: string,
  ): Promise<UserListingDetail | undefined>;
  getListings(
    params: GetListingsParams,
  ): Promise<ListingsPage>;
  getListingsPageByOwner(
    ownerId: string,
    params: GetUserListingsParams,
  ): Promise<UserListingsPage>;
}

export const LISTINGS_REPOSITORY = Symbol(
  'LISTINGS_REPOSITORY',
);
