import type { RoommateRequestsPage } from '@/api/roommateRequests/domain/entity/roommateRequest';

export interface Favourite {
  id: string;
  roommateRequestId: string;
  userId: string;
  createdAt: Date;
}

export interface GetFavouritesParams {
  limit: number;
  cursor?: string;
}

export type FavouritesPage = RoommateRequestsPage;
