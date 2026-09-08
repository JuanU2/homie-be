import {
  CreateRoommateApplicationModel,
  GetRoommateApplicationsParams,
  RoommateApplication,
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
}

export const ROOMMATE_APPLICATIONS_REPOSITORY = Symbol(
  'ROOMMATE_APPLICATIONS_REPOSITORY',
);
