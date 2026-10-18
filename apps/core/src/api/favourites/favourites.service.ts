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
  type IRoommateRequestsRepository,
  ROOMMATE_REQUESTS_REPOSITORY,
} from '@/api/roommateRequests/domain/interface/roommateRequests.repository';

@Injectable()
export class FavouritesService {
  constructor(
    @Inject(FAVOURITES_REPOSITORY)
    private readonly favouritesRepository: IFavouritesRepository,
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
  ) {}

  async create(userId: string, roommateRequestId: string): Promise<Favourite> {
    const request =
      await this.roommateRequestsRepository.getRoommateRequestById(
        roommateRequestId,
      );

    if (!request) {
      throw new NotFoundException('Roommate request not found');
    }

    return this.favouritesRepository.create(userId, roommateRequestId);
  }

  async delete(userId: string, roommateRequestId: string): Promise<void> {
    await this.favouritesRepository.delete(userId, roommateRequestId);
  }

  async getFavourites(
    userId: string,
    params: GetFavouritesParams,
  ): Promise<FavouritesPage> {
    return this.favouritesRepository.getFavouritesPage(userId, params);
  }
}
