import {
  Favourite,
  FavouritesPage,
  GetFavouritesParams,
} from '@/api/favourites/domain/entity/favourite';

export interface IFavouritesRepository {
  create(userId: string, roommateRequestId: string): Promise<Favourite>;
  delete(userId: string, roommateRequestId: string): Promise<void>;
  exists(userId: string, roommateRequestId: string): Promise<boolean>;
  getFavouritesPage(
    userId: string,
    params: GetFavouritesParams,
  ): Promise<FavouritesPage>;
}

export const FAVOURITES_REPOSITORY = Symbol('FAVOURITES_REPOSITORY');
