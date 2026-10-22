import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type IListingsRepository,
  LISTINGS_REPOSITORY,
} from '@/api/listings/domain/interface/listings.repository';
import {
  CreateListingDtoRequest,
  ListingDetailDtoResponse,
  listingDetailDtoResponseSchema,
  ListingDtoResponse,
  UpdateListingDtoRequest,
  UpdateListingStatusDtoRequest,
  UserListingDetailDtoResponse,
  userListingDetailDtoResponseSchema,
} from '@/api/listings/dtos/listings.dto';
import {
  GetListingsParams,
  GetUserListingsParams,
  ListingDetail,
  ListingsPage,
  UpdateListingStatusModel,
  UserListingsPage,
} from '@/api/listings/domain/entity/listing';
import {
  type IPropertiesRepository,
  PROPERTIES_REPOSITORY,
} from '@/api/properties/domain/interface/properties.repository';
import {
  LISTING_CREATED_EVENT_TYPE,
  LISTING_CREATED_ROUTING_KEY,
  LISTING_UPDATED_EVENT_TYPE,
  LISTING_UPDATED_ROUTING_KEY,
} from '@homie/events';
import { EventPublisher } from '@/messaging/event.publisher';
import { RoommateApplicationsService } from '@/api/roommateApplications/roommateApplications.service';
import {
  FAVOURITES_REPOSITORY,
  type IFavouritesRepository,
} from '@/api/favourites/domain/interface/favourites.repository';

@Injectable()
export class ListingsService {
  constructor(
    @Inject(LISTINGS_REPOSITORY)
    private readonly listingsRepository: IListingsRepository,
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: IPropertiesRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly roommateApplicationsService: RoommateApplicationsService,
    @Inject(FAVOURITES_REPOSITORY)
    private readonly favouritesRepository: IFavouritesRepository,
  ) {}

  async createListing(
    userId: string,
    data: CreateListingDtoRequest,
  ): Promise<ListingDtoResponse> {
    const ownerId = await this.propertiesRepository.getOwnerId(data.propertyId);
    if (!ownerId) {
      throw new NotFoundException('Property not found');
    }
    if (ownerId !== userId) {
      throw new ForbiddenException(
        'You can only create a listing for your own property',
      );
    }

    const request = await this.listingsRepository.createListing({
      propertyId: data.propertyId,
      createdBy: userId,
      title: data.title,
      description: data.description,
      priceAmount: data.priceAmount,
      priceCurrency: data.priceCurrency,
      idealMoveInDate: data.idealMoveInDate,
      maxRoommates: data.maxRoommates,
      currentRoommates: data.currentRoommates,
      preferredGender: data.preferredGender,
    });

    await this.publishListingEvent(
      LISTING_CREATED_EVENT_TYPE,
      LISTING_CREATED_ROUTING_KEY,
      request.id,
    );

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async updateListing(
    userId: string,
    id: string,
    data: UpdateListingDtoRequest,
  ): Promise<ListingDtoResponse> {
    const existing = await this.listingsRepository.getListingById(
      id,
    );

    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only update your own listing',
      );
    }

    const request = await this.listingsRepository.updateListing(
      id,
      {
        title: data.title,
        description: data.description,
        priceAmount: data.priceAmount,
        priceCurrency: data.priceCurrency,
        idealMoveInDate: data.idealMoveInDate,
        maxRoommates: data.maxRoommates,
        currentRoommates: data.currentRoommates,
        preferredGender: data.preferredGender,
      },
    );

    if (!request) {
      throw new NotFoundException('Listing not found');
    }

    await this.publishListingEvent(
      LISTING_UPDATED_EVENT_TYPE,
      LISTING_UPDATED_ROUTING_KEY,
      request.id,
    );

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async updateListingStatus(
    userId: string,
    id: string,
    data: UpdateListingStatusDtoRequest,
  ): Promise<ListingDtoResponse> {
    const existing =
      await this.listingsRepository.getListingById(id);

    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only update your own listing',
      );
    }

    const updates: UpdateListingStatusModel = {
      status: data.status,
    };

    if (data.status === 'ACTIVE') {
      if (existing.status === 'CLOSED') {
        if (
          data.maxRoommates === undefined ||
          data.currentRoommates === undefined
        ) {
          throw new BadRequestException(
            'maxRoommates and currentRoommates are required when reactivating a closed listing',
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
      await this.listingsRepository.updateListingStatus(
        id,
        updates,
      );

    if (!request) {
      throw new NotFoundException('Listing not found');
    }

    await this.publishListingEvent(
      LISTING_UPDATED_EVENT_TYPE,
      LISTING_UPDATED_ROUTING_KEY,
      request.id,
    );

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async getListingDetail(
    id: string,
    userId?: string,
  ): Promise<ListingDetailDtoResponse> {
    const detail = await this.listingsRepository.getListingDetail(
      id,
    );

    if (!detail) {
      throw new NotFoundException('Listing not found');
    }

    const { canApply, application } = userId
      ? await this.roommateApplicationsService.canApplyToListing(
          userId,
          detail,
        )
      : { canApply: false, application: undefined };

    const favourite = userId
      ? await this.favouritesRepository.exists(userId, id)
      : false;

    return listingDetailDtoResponseSchema.parse({
      ...detail,
      canApply,
      application,
      favourite,
    });
  }

  async getUserListingDetail(
    userId: string,
    listingId: string,
  ): Promise<UserListingDetailDtoResponse> {
    const detail =
      await this.listingsRepository.getUserListingDetail(
        userId,
        listingId,
      );

    if (!detail) {
      throw new NotFoundException('Listing not found');
    }

    const { canApply, application } =
      await this.roommateApplicationsService.canApplyToListing(
        userId,
        detail,
      );

    const favourite = await this.favouritesRepository.exists(
      userId,
      listingId,
    );

    return userListingDetailDtoResponseSchema.parse({
      ...detail,
      canApply,
      application,
      favourite,
    });
  }

  async getListings(
    params: GetListingsParams,
  ): Promise<ListingsPage> {
    return this.listingsRepository.getListings(params);
  }

  async getUserListings(
    userId: string,
    params: GetUserListingsParams,
  ): Promise<UserListingsPage> {
    return this.listingsRepository.getListingsPageByOwner(
      userId,
      params,
    );
  }

  private async publishListingEvent(
    eventType: string,
    routingKey: string,
    listingId: string,
  ): Promise<void> {
    const detail =
      await this.listingsRepository.getListingDetail(
        listingId,
      );

    if (!detail) {
      return;
    }

    await this.eventPublisher.publish(eventType, routingKey, this.toBlob(detail));
  }

  private toBlob(detail: ListingDetail) {
    const { createdBy, owner, property, ...request } = detail;
    const { ownerId, ...propertyData } = property;
    return { ...request, property: propertyData };
  }
}
