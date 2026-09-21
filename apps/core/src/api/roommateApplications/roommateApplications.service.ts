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
  UpdateRoommateApplicationDtoRequest,
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

  async updateRoommateApplicationStatus(
    userId: string,
    roommateApplicationId: string,
    data: UpdateRoommateApplicationDtoRequest,
  ): Promise<RoommateApplicationDtoResponse> {
    const application =
      await this.roommateApplicationsRepository.getRoommateApplicationById(
        roommateApplicationId,
      );

    if (!application) {
      throw new NotFoundException('Roommate application not found');
    }

    const roommateRequest =
      await this.roommateRequestsRepository.getRoommateRequestById(
        application.roommateRequestId,
      );

    if (!roommateRequest) {
      throw new NotFoundException('Roommate request not found');
    }

    if (roommateRequest.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only update applications for your own roommate request',
      );
    }

    const shouldIncrement =
      data.status === 'ACCEPTED' &&
      data.incrementCurrentRoommates === true &&
      application.status !== 'ACCEPTED';

    const updated = shouldIncrement
      ? await this.roommateApplicationsRepository.acceptRoommateApplication(
          roommateApplicationId,
          application.roommateRequestId,
        )
      : await this.roommateApplicationsRepository.updateRoommateApplicationStatus(
          roommateApplicationId,
          data.status,
        );

    if (!updated) {
      throw new NotFoundException('Roommate application not found');
    }

    const tokens = await this.deviceTokensService.getTokens(
      application.applicantId,
    );
    await this.pushService.send(tokens, {
      title: 'Roommate application updated',
      body: `Your application to "${roommateRequest.title}" was ${data.status.toLowerCase()}`,
      data: {
        type: 'application_status_changed',
        roommateRequestId: roommateRequest.id,
        applicationId: application.id,
        status: data.status,
      },
    });

    return updated;
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
