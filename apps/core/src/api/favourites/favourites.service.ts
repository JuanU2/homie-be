import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  Favourite,
  FavouritesPage,
  GetFavouritesParams,
} from '@/api/favourites/domain/entity/favourite';
import {
  FAVOURITES_REPOSITORY,
  type IFavouritesRepository,
} from '@/api/favourites/domain/interface/favourites.repository';
import {
  type IListingsRepository,
  LISTINGS_REPOSITORY,
} from '@/api/listings/domain/interface/listings.repository';

@Injectable()
export class FavouritesService {
  constructor(
    @Inject(FAVOURITES_REPOSITORY)
    private readonly favouritesRepository: IFavouritesRepository,
    @Inject(LISTINGS_REPOSITORY)
    private readonly listingsRepository: IListingsRepository,
  ) {}

  async create(userId: string, listingId: string): Promise<Favourite> {
    const request =
      await this.listingsRepository.getListingById(
        listingId,
      );

    if (!request) {
      throw new NotFoundException('Listing not found');
    }

    return this.favouritesRepository.create(userId, listingId);
  }

  async delete(userId: string, listingId: string): Promise<void> {
    await this.favouritesRepository.delete(userId, listingId);
  }

  async getFavourites(
    userId: string,
    params: GetFavouritesParams,
  ): Promise<FavouritesPage> {
    return this.favouritesRepository.getFavouritesPage(userId, params);
  }
}
