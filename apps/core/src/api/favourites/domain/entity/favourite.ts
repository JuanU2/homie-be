import type { ListingsPage } from '@/api/listings/domain/entity/listing';

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

export type FavouritesPage = ListingsPage;
