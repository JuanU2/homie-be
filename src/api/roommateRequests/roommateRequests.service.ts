import {
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
  RoommateRequestDtoResponse,
} from '@/api/roommateRequests/dtos/roommateRequests.dto';
import {
  type IPropertiesRepository,
  PROPERTIES_REPOSITORY,
} from '@/api/properties/domain/interface/properties.repository';

@Injectable()
export class RoommateRequestsService {
  constructor(
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: IPropertiesRepository,
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
      description: data.description,
      priceAmount: data.priceAmount,
      priceCurrency: data.priceCurrency,
      idealMoveInDate: data.idealMoveInDate,
      maxRoommates: data.maxRoommates,
      currentRoommates: data.currentRoommates,
    });

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async getRoommateRequestById(
    id: string,
  ): Promise<RoommateRequestDtoResponse | undefined> {
    const request = await this.roommateRequestsRepository.getRoommateRequestById(id);

    if (!request) {
      return undefined;
    }

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    };
  }

  async getAllRoommateRequests(): Promise<RoommateRequestDtoResponse[]> {
    const requests = await this.roommateRequestsRepository.getAllRoommateRequests();

    return requests.map(request => ({
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
    }));
  }
}
