import {
  CreateRoommateRequestModel,
  GetRoommateRequestsParams,
  RoommateRequest,
  RoommateRequestsPage,
} from '@/api/roommateRequests/domain/entity/roommateRequest';

export interface IRoommateRequestsRepository {
  createRoommateRequest(
    request: CreateRoommateRequestModel,
  ): Promise<RoommateRequest>;
  getRoommateRequestById(id: string): Promise<RoommateRequest | undefined>;
  getRoommateRequestsPage(
    params: GetRoommateRequestsParams,
  ): Promise<RoommateRequestsPage>;
}

export const ROOMMATE_REQUESTS_REPOSITORY = Symbol(
  'ROOMMATE_REQUESTS_REPOSITORY',
);
