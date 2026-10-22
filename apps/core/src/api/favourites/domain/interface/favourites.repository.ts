import {
  Favourite,
  FavouritesPage,
  GetFavouritesParams,
} from '@/api/favourites/domain/entity/favourite';

export interface IFavouritesRepository {
  create(userId: string, listingId: string): Promise<Favourite>;
  delete(userId: string, listingId: string): Promise<void>;
  exists(userId: string, listingId: string): Promise<boolean>;
  getFavouritesPage(
    userId: string,
    params: GetFavouritesParams,
  ): Promise<FavouritesPage>;
}

export const FAVOURITES_REPOSITORY = Symbol('FAVOURITES_REPOSITORY');
