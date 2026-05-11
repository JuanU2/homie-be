import {
  CreateRoommateRequestModel,
  RoommateRequest,
} from '@/api/roommateRequests/domain/entity/roommateRequest';

export interface IRoommateRequestsRepository {
  createRoommateRequest(
    request: CreateRoommateRequestModel,
  ): Promise<RoommateRequest>;
  getRoommateRequestById(id: string): Promise<RoommateRequest | undefined>;
  getAllRoommateRequests(): Promise<RoommateRequest[]>;
}

export const ROOMMATE_REQUESTS_REPOSITORY = Symbol(
  'ROOMMATE_REQUESTS_REPOSITORY',
);
