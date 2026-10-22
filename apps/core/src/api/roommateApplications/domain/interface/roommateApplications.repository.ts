import {
  CreateRoommateApplicationModel,
  GetRoommateApplicationsParams,
  RoommateApplication,
  RoommateApplicationStatus,
  RoommateApplicationWithApplicant,
  RoommateApplicationsPage,
  RoommateApplicationsWithApplicantPage,
} from '@/api/roommateApplications/domain/entity/roommateApplication';

export interface IRoommateApplicationsRepository {
  createRoommateApplication(
    model: CreateRoommateApplicationModel,
  ): Promise<RoommateApplication>;
  getRoommateApplicationById(
    id: string,
  ): Promise<RoommateApplication | undefined>;
  getLatestActiveApplication(
    applicantId: string,
    listingId: string,
  ): Promise<RoommateApplication | undefined>;
  updateRoommateApplicationStatus(
    id: string,
    status: RoommateApplicationStatus,
  ): Promise<RoommateApplication | undefined>;
  acceptRoommateApplication(
    id: string,
    listingId: string,
  ): Promise<RoommateApplication | undefined>;
  getRoommateApplicationsPage(
    applicantId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsPage>;
  getRoommateApplicationsForRequest(
    listingId: string,
  ): Promise<RoommateApplicationWithApplicant[]>;
  getRoommateApplicationsPageForOwner(
    ownerId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsWithApplicantPage>;
}

export const ROOMMATE_APPLICATIONS_REPOSITORY = Symbol(
  'ROOMMATE_APPLICATIONS_REPOSITORY',
);
