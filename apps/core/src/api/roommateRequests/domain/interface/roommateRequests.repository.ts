import {
  CreateRoommateRequestModel,
  GetRoommateRequestsParams,
  GetUserRoommateRequestsParams,
  RoommateRequest,
  RoommateRequestDetail,
  RoommateRequestsPage,
  UpdateRoommateRequestModel,
  UpdateRoommateRequestStatusModel,
  UserRoommateRequestDetail,
  UserRoommateRequestsPage,
} from '@/api/roommateRequests/domain/entity/roommateRequest';

export interface IRoommateRequestsRepository {
  createRoommateRequest(
    request: CreateRoommateRequestModel,
  ): Promise<RoommateRequest>;
  updateRoommateRequest(
    id: string,
    request: UpdateRoommateRequestModel,
  ): Promise<RoommateRequest | undefined>;
  updateRoommateRequestStatus(
    id: string,
    updates: UpdateRoommateRequestStatusModel,
  ): Promise<RoommateRequest | undefined>;
  getRoommateRequestById(id: string): Promise<RoommateRequest | undefined>;
  getRoommateRequestDetail(
    id: string,
  ): Promise<RoommateRequestDetail | undefined>;
  getUserRoommateRequestDetail(
    userId: string,
    roommateRequestId: string,
  ): Promise<UserRoommateRequestDetail | undefined>;
  getRoommateRequests(
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
