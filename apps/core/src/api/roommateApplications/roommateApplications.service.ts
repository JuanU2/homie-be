import {
  BadRequestException,
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
  type IListingsRepository,
  LISTINGS_REPOSITORY,
} from '@/api/listings/domain/interface/listings.repository';
import {
  CreateRoommateApplicationDtoRequest,
  RoommateApplicationDtoResponse,
  RoommateApplicationWithApplicantDtoResponse,
  roommateApplicationWithApplicantResponseSchema,
  RoommateApplicationsCountDtoResponse,
  roommateApplicationsCountResponseSchema,
  RoommateApplicationsWithApplicantPageDtoResponse,
  roommateApplicationsWithApplicantPageResponseSchema,
  UpdateRoommateApplicationDtoRequest,
} from '@/api/roommateApplications/dtos/roommateApplications.dto';
import {
  GetRoommateApplicationsParams,
  RoommateApplication,
  RoommateApplicationsPage,
  RoommateApplicationStatus,
} from '@/api/roommateApplications/domain/entity/roommateApplication';
import type { Listing } from '@/api/listings/domain/entity/listing';
import { DeviceTokensService } from '@/api/deviceTokens/deviceTokens.service';
import { PushService } from '@/push/push.service';
import z from 'zod';

@Injectable()
export class RoommateApplicationsService {
  constructor(
    @Inject(ROOMMATE_APPLICATIONS_REPOSITORY)
    private readonly roommateApplicationsRepository: IRoommateApplicationsRepository,
    @Inject(LISTINGS_REPOSITORY)
    private readonly listingsRepository: IListingsRepository,
    private readonly deviceTokensService: DeviceTokensService,
    private readonly pushService: PushService,
  ) {}

  async createRoommateApplication(
    applicantId: string,
    data: CreateRoommateApplicationDtoRequest,
  ): Promise<RoommateApplicationDtoResponse> {
    const listing =
      await this.listingsRepository.getListingById(
        data.listingId,
      );

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status === 'CLOSED') {
      throw new BadRequestException(
        'Cannot apply to a closed listing',
      );
    }

    const { canApply } = await this.canApplyToListing(
      applicantId,
      listing,
    );

    if (!canApply) {
      if (listing.createdBy === applicantId) {
        throw new BadRequestException(
          'You cannot apply to your own listing',
        );
      }
      throw new BadRequestException(
        'You already have a pending or accepted application for this listing',
      );
    }

    const application =
      await this.roommateApplicationsRepository.createRoommateApplication({
        listingId: data.listingId,
        applicantId,
        note: data.note,
      });

    const tokens = await this.deviceTokensService.getTokens(
      listing.createdBy,
    );
    await this.pushService.send(tokens, {
      title: 'New roommate application',
      body: `Someone applied to "${listing.title}"`,
      data: {
        type: 'new_application',
        listingId: listing.id,
        applicationId: application.id,
      },
    });

    return application;
  }

  async canApplyToListing(
    userId: string,
    listing: Listing,
  ): Promise<{ canApply: boolean; application?: RoommateApplication }> {
    if (listing.createdBy === userId) {
      return { canApply: false };
    }

    if (listing.status === 'CLOSED') {
      return { canApply: false };
    }

    const application =
      await this.roommateApplicationsRepository.getLatestActiveApplication(
        userId,
        listing.id,
      );

    if (!application) {
      return { canApply: true };
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);

    if (application.updatedAt < cutoff) {
      return { canApply: true };
    }

    return { canApply: false, application };
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

    const listing =
      await this.listingsRepository.getListingById(
        application.listingId,
      );

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only update applications for your own listing',
      );
    }

    const shouldIncrement =
      data.status === 'ACCEPTED' &&
      data.incrementCurrentRoommates === true &&
      application.status !== 'ACCEPTED';

    const updated = shouldIncrement
      ? await this.roommateApplicationsRepository.acceptRoommateApplication(
          roommateApplicationId,
          application.listingId,
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
      body: `Your application to "${listing.title}" was ${data.status.toLowerCase()}`,
      data: {
        type: 'application_status_changed',
        listingId: listing.id,
        applicationId: application.id,
        status: data.status,
      },
    });

    return updated;
  }

  async getRoommateApplications(
    applicantId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsPage> {
    return this.roommateApplicationsRepository.getRoommateApplicationsPage(
      applicantId,
      params,
    );
  }

  async getRoommateApplicationsForRequest(
    userId: string,
    listingId: string,
  ): Promise<RoommateApplicationWithApplicantDtoResponse[]> {
    const listing =
      await this.listingsRepository.getListingById(
        listingId,
      );

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only view applications for your own listing',
      );
    }

    const applications =
      await this.roommateApplicationsRepository.getRoommateApplicationsForRequest(
        listingId,
      );

    return z
      .array(roommateApplicationWithApplicantResponseSchema)
      .parse(applications);
  }

  async getRoommateApplicationsForOwner(
    ownerId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsWithApplicantPageDtoResponse> {
    const page =
      await this.roommateApplicationsRepository.getRoommateApplicationsPageForOwner(
        ownerId,
        params,
      );

    return roommateApplicationsWithApplicantPageResponseSchema.parse(page);
  }

  async countRoommateApplicationsForOwner(
    ownerId: string,
    status?: RoommateApplicationStatus,
  ): Promise<RoommateApplicationsCountDtoResponse> {
    const count =
      await this.roommateApplicationsRepository.countRoommateApplicationsForOwner(
        ownerId,
        status,
      );

    return roommateApplicationsCountResponseSchema.parse({ count });
  }
}
