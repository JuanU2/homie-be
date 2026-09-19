import {
  CreateRoommateApplicationModel,
  GetRoommateApplicationsParams,
  RoommateApplication,
  RoommateApplicationStatus,
  RoommateApplicationWithApplicant,
  RoommateApplicationsPage,
} from '@/api/roommateApplications/domain/entity/roommateApplication';

export interface IRoommateApplicationsRepository {
  createRoommateApplication(
    model: CreateRoommateApplicationModel,
  ): Promise<RoommateApplication>;
  getRoommateApplicationById(
    id: string,
  ): Promise<RoommateApplication | undefined>;
  updateRoommateApplicationStatus(
    id: string,
    status: RoommateApplicationStatus,
  ): Promise<RoommateApplication | undefined>;
  acceptRoommateApplication(
    id: string,
    roommateRequestId: string,
  ): Promise<RoommateApplication | undefined>;
  getRoommateApplicationsPage(
    ownerId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsPage>;
  getRoommateApplicationsForRequest(
    roommateRequestId: string,
  ): Promise<RoommateApplicationWithApplicant[]>;
}

export const ROOMMATE_APPLICATIONS_REPOSITORY = Symbol(
  'ROOMMATE_APPLICATIONS_REPOSITORY',
);
