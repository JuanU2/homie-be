import {
  CreateRoommateRequestModel,
  GetRoommateRequestsParams,
  GetUserRoommateRequestsParams,
  RoommateRequest,
  RoommateRequestDetail,
  RoommateRequestsPage,
  UserRoommateRequestDetail,
  UserRoommateRequestsPage,
} from '@/api/roommateRequests/domain/entity/roommateRequest';

export interface IRoommateRequestsRepository {
  createRoommateRequest(
    request: CreateRoommateRequestModel,
  ): Promise<RoommateRequest>;
  getRoommateRequestById(id: string): Promise<RoommateRequest | undefined>;
  getRoommateRequestDetail(
    id: string,
  ): Promise<RoommateRequestDetail | undefined>;
  getUserRoommateRequestDetail(
    userId: string,
    roommateRequestId: string,
  ): Promise<UserRoommateRequestDetail | undefined>;
  getRoommateRequestsPage(
    params: GetRoommateRequestsParams,
  ): Promise<RoommateRequestsPage>;
  getRoommateRequestsPageByOwner(
    ownerId: string,
    params: GetUserRoommateRequestsParams,
  ): Promise<UserRoommateRequestsPage>;
}

export const ROOMMATE_REQUESTS_REPOSITORY = Symbol(
  'ROOMMATE_REQUESTS_REPOSITORY',
);
