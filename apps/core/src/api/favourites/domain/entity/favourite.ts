import type {
  ListingListItem,
  ListingStatus,
} from '@/api/listings/domain/entity/listing';

export interface Favourite {
  id: string;
  listingId: string;
  userId: string;
  createdAt: Date;
}

export interface GetFavouritesParams {
  limit: number;
  cursor?: string;
}

export interface FavouriteListItem extends ListingListItem {
  status: ListingStatus;
}

export interface FavouritesPage {
  items: FavouriteListItem[];
  nextCursor: string | null;
}
