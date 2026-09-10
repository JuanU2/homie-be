import {
  CreateRoommateApplicationModel,
  GetRoommateApplicationsParams,
  RoommateApplication,
  RoommateApplicationWithApplicant,
  RoommateApplicationsPage,
} from '@/api/roommateApplications/domain/entity/roommateApplication';

export interface IRoommateApplicationsRepository {
  createRoommateApplication(
    model: CreateRoommateApplicationModel,
  ): Promise<RoommateApplication>;
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
