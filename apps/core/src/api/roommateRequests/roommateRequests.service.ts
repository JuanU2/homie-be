import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type IRoommateRequestsRepository,
  ROOMMATE_REQUESTS_REPOSITORY,
} from '@/api/roommateRequests/domain/interface/roommateRequests.repository';
import {
  CreateRoommateRequestDtoRequest,
  RoommateRequestDetailDtoResponse,
  roommateRequestDetailDtoResponseSchema,
  RoommateRequestDtoResponse,
  UpdateRoommateRequestDtoRequest,
  UpdateRoommateRequestStatusDtoRequest,
  UserRoommateRequestDetailDtoResponse,
  userRoommateRequestDetailDtoResponseSchema,
} from '@/api/roommateRequests/dtos/roommateRequests.dto';
import {
  GetRoommateRequestsParams,
  GetUserRoommateRequestsParams,
  RoommateRequestDetail,
  RoommateRequestsPage,
  UpdateRoommateRequestStatusModel,
  UserRoommateRequestsPage,
} from '@/api/roommateRequests/domain/entity/roommateRequest';
import {
  type IPropertiesRepository,
  PROPERTIES_REPOSITORY,
} from '@/api/properties/domain/interface/properties.repository';
import {
  ROOMMATE_REQUEST_CREATED_EVENT_TYPE,
  ROOMMATE_REQUEST_CREATED_ROUTING_KEY,
  ROOMMATE_REQUEST_UPDATED_EVENT_TYPE,
  ROOMMATE_REQUEST_UPDATED_ROUTING_KEY,
} from '@homie/events';
import { EventPublisher } from '@/messaging/event.publisher';

@Injectable()
export class RoommateRequestsService {
  constructor(
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: IPropertiesRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async createRoommateRequest(
    userId: string,
    data: CreateRoommateRequestDtoRequest,
  ): Promise<RoommateRequestDtoResponse> {
    const ownerId = await this.propertiesRepository.getOwnerId(data.propertyId);
    if (!ownerId) {
      throw new NotFoundException('Property not found');
    }
    if (ownerId !== userId) {
      throw new ForbiddenException(
        'You can only create a roommate request for your own property',
      );
    }

    const request = await this.roommateRequestsRepository.createRoommateRequest({
      propertyId: data.propertyId,
      createdBy: userId,
      title: data.title,
      description: data.description,
      priceAmount: data.priceAmount,
      priceCurrency: data.priceCurrency,
      idealMoveInDate: data.idealMoveInDate,
      maxRoommates: data.maxRoommates,
      currentRoommates: data.currentRoommates,
    });

    await this.publishRoommateRequestEvent(
      ROOMMATE_REQUEST_CREATED_EVENT_TYPE,
      ROOMMATE_REQUEST_CREATED_ROUTING_KEY,
      request.id,
    );

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async updateRoommateRequest(
    userId: string,
    id: string,
    data: UpdateRoommateRequestDtoRequest,
  ): Promise<RoommateRequestDtoResponse> {
    const existing = await this.roommateRequestsRepository.getRoommateRequestById(
      id,
    );

    if (!existing) {
      throw new NotFoundException('Roommate request not found');
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only update your own roommate request',
      );
    }

    const request = await this.roommateRequestsRepository.updateRoommateRequest(
      id,
      {
        title: data.title,
        description: data.description,
        priceAmount: data.priceAmount,
        priceCurrency: data.priceCurrency,
        idealMoveInDate: data.idealMoveInDate,
        maxRoommates: data.maxRoommates,
        currentRoommates: data.currentRoommates,
      },
    );

    if (!request) {
      throw new NotFoundException('Roommate request not found');
    }

    await this.publishRoommateRequestEvent(
      ROOMMATE_REQUEST_UPDATED_EVENT_TYPE,
      ROOMMATE_REQUEST_UPDATED_ROUTING_KEY,
      request.id,
    );

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async updateRoommateRequestStatus(
    userId: string,
    id: string,
    data: UpdateRoommateRequestStatusDtoRequest,
  ): Promise<RoommateRequestDtoResponse> {
    const existing =
      await this.roommateRequestsRepository.getRoommateRequestById(id);

    if (!existing) {
      throw new NotFoundException('Roommate request not found');
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only update your own roommate request',
      );
    }

    const updates: UpdateRoommateRequestStatusModel = {
      status: data.status,
    };

    if (data.status === 'ACTIVE') {
      if (existing.status === 'CLOSED') {
        if (
          data.maxRoommates === undefined ||
          data.currentRoommates === undefined
        ) {
          throw new BadRequestException(
            'maxRoommates and currentRoommates are required when reactivating a closed request',
          );
        }
        if (data.maxRoommates - data.currentRoommates <= 0) {
          throw new BadRequestException(
            'maxRoommates must be greater than currentRoommates',
          );
        }
      }

      if (data.maxRoommates !== undefined) {
        updates.maxRoommates = data.maxRoommates;
      }
      if (data.currentRoommates !== undefined) {
        updates.currentRoommates = data.currentRoommates;
      }
      updates.closedAt = null;
    } else if (data.status === 'CLOSED') {
      updates.closedAt = new Date();
    }

    const request =
      await this.roommateRequestsRepository.updateRoommateRequestStatus(
        id,
        updates,
      );

    if (!request) {
      throw new NotFoundException('Roommate request not found');
    }

    await this.publishRoommateRequestEvent(
      ROOMMATE_REQUEST_UPDATED_EVENT_TYPE,
      ROOMMATE_REQUEST_UPDATED_ROUTING_KEY,
      request.id,
    );

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async getRoommateRequestDetail(
    id: string,
  ): Promise<RoommateRequestDetailDtoResponse> {
    const detail = await this.roommateRequestsRepository.getRoommateRequestDetail(
      id,
    );

    if (!detail) {
      throw new NotFoundException('Roommate request not found');
    }

    return roommateRequestDetailDtoResponseSchema.parse(detail);
  }

  async getUserRoommateRequestDetail(
    userId: string,
    roommateRequestId: string,
  ): Promise<UserRoommateRequestDetailDtoResponse> {
    const detail =
      await this.roommateRequestsRepository.getUserRoommateRequestDetail(
        userId,
        roommateRequestId,
      );

    if (!detail) {
      throw new NotFoundException('Roommate request not found');
    }

    return userRoommateRequestDetailDtoResponseSchema.parse(detail);
  }

  async getRoommateRequests(
    params: GetRoommateRequestsParams,
  ): Promise<RoommateRequestsPage> {
    return this.roommateRequestsRepository.getRoommateRequestsPage(params);
  }

  async getUserRoommateRequests(
    userId: string,
    params: GetUserRoommateRequestsParams,
  ): Promise<UserRoommateRequestsPage> {
    return this.roommateRequestsRepository.getRoommateRequestsPageByOwner(
      userId,
      params,
    );
  }

  private async publishRoommateRequestEvent(
    eventType: string,
    routingKey: string,
    roommateRequestId: string,
  ): Promise<void> {
    const detail =
      await this.roommateRequestsRepository.getRoommateRequestDetail(
        roommateRequestId,
      );

    if (!detail) {
      return;
    }

    await this.eventPublisher.publish(eventType, routingKey, this.toBlob(detail));
  }

  private toBlob(detail: RoommateRequestDetail) {
    const { createdBy, owner, property, ...request } = detail;
    const { ownerId, ...propertyData } = property;
    return { ...request, property: propertyData };
  }
}
