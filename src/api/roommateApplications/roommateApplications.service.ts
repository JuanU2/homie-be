import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IRoommateApplicationsRepository,
  ROOMMATE_APPLICATIONS_REPOSITORY,
} from '@/api/roommateApplications/domain/interface/roommateApplications.repository';
import {
  type IRoommateRequestsRepository,
  ROOMMATE_REQUESTS_REPOSITORY,
} from '@/api/roommateRequests/domain/interface/roommateRequests.repository';
import {
  CreateRoommateApplicationDtoRequest,
  RoommateApplicationDtoResponse,
} from '@/api/roommateApplications/dtos/roommateApplications.dto';
import {
  GetRoommateApplicationsParams,
  RoommateApplicationsPage,
} from '@/api/roommateApplications/domain/entity/roommateApplication';

@Injectable()
export class RoommateApplicationsService {
  constructor(
    @Inject(ROOMMATE_APPLICATIONS_REPOSITORY)
    private readonly roommateApplicationsRepository: IRoommateApplicationsRepository,
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
  ) {}

  async createRoommateApplication(
    applicantId: string,
    data: CreateRoommateApplicationDtoRequest,
  ): Promise<RoommateApplicationDtoResponse> {
    const roommateRequest =
      await this.roommateRequestsRepository.getRoommateRequestById(
        data.roommateRequestId,
      );

    if (!roommateRequest) {
      throw new NotFoundException('Roommate request not found');
    }

    const application =
      await this.roommateApplicationsRepository.createRoommateApplication({
        roommateRequestId: data.roommateRequestId,
        applicantId,
        note: data.note,
      });

    // TODO: send a push notification to the property owner (roommateRequest.createdBy) via Firebase.

    return application;
  }

  async getRoommateApplications(
    ownerId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsPage> {
    return this.roommateApplicationsRepository.getRoommateApplicationsPage(
      ownerId,
      params,
    );
  }
}
