import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  RoommateApplicationWithApplicantDtoResponse,
  roommateApplicationWithApplicantResponseSchema,
} from '@/api/roommateApplications/dtos/roommateApplications.dto';
import {
  GetRoommateApplicationsParams,
  RoommateApplicationsPage,
} from '@/api/roommateApplications/domain/entity/roommateApplication';
import { DeviceTokensService } from '@/api/deviceTokens/deviceTokens.service';
import { PushService } from '@/push/push.service';
import z from 'zod';

@Injectable()
export class RoommateApplicationsService {
  constructor(
    @Inject(ROOMMATE_APPLICATIONS_REPOSITORY)
    private readonly roommateApplicationsRepository: IRoommateApplicationsRepository,
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
    private readonly deviceTokensService: DeviceTokensService,
    private readonly pushService: PushService,
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

    const tokens = await this.deviceTokensService.getTokens(
      roommateRequest.createdBy,
    );
    await this.pushService.send(tokens, {
      title: 'New roommate application',
      body: `Someone applied to "${roommateRequest.title}"`,
      data: {
        type: 'new_application',
        roommateRequestId: roommateRequest.id,
        applicationId: application.id,
      },
    });

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

  async getRoommateApplicationsForRequest(
    userId: string,
    roommateRequestId: string,
  ): Promise<RoommateApplicationWithApplicantDtoResponse[]> {
    const roommateRequest =
      await this.roommateRequestsRepository.getRoommateRequestById(
        roommateRequestId,
      );

    if (!roommateRequest) {
      throw new NotFoundException('Roommate request not found');
    }

    if (roommateRequest.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only view applications for your own roommate request',
      );
    }

    const applications =
      await this.roommateApplicationsRepository.getRoommateApplicationsForRequest(
        roommateRequestId,
      );

    return z
      .array(roommateApplicationWithApplicantResponseSchema)
      .parse(applications);
  }
}
