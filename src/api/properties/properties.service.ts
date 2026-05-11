import { Inject, Injectable } from '@nestjs/common';
import { PROPERTIES_REPOSITORY, type IPropertiesRepository } from '@/api/properties/domain/interface/properties.repository';
import { CreatePropertyDtoRequest, CreatePropertyDtoResponse, roomTypeEnum } from './dtos/properties.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: IPropertiesRepository,
  ) {}

  async createProperty(createPropertyDto: CreatePropertyDtoRequest): Promise<CreatePropertyDtoResponse> {
    const createdProperty = await this.propertiesRepository.createProperty({
      ownerId: createPropertyDto.ownerId,
      description: createPropertyDto.description,
      sizeM2: createPropertyDto.sizeM2,
      roomCount: createPropertyDto.roomCount,
      country: createPropertyDto.country,
      city: createPropertyDto.city,
      zipCode: createPropertyDto.zipCode,
      street: createPropertyDto.street,
      streetNumber: createPropertyDto.streetNumber,
      lat: createPropertyDto.lat,
      lng: createPropertyDto.lng,
      rooms: createPropertyDto.rooms,
      equipment: createPropertyDto.equipment,
    });

    return {
      id: createdProperty.property.id,
      ownerId: createdProperty.property.ownerId,
      description: createdProperty.property.description,
      sizeM2: createdProperty.property.sizeM2 ?? undefined,
      roomCount: createdProperty.property.roomCount,
      country: createdProperty.property.country,
      city: createdProperty.property.city,
      zipCode: createdProperty.property.zipCode,
      street: createdProperty.property.street,
      streetNumber: createdProperty.property.streetNumber,
      lat: createPropertyDto.lat,
      lng: createPropertyDto.lng,
      createdAt: createdProperty.property.createdAt,
      updatedAt: createdProperty.property.updatedAt,
      rooms: createdProperty.rooms.map(room => ({
        roomType: room.roomType as roomTypeEnum,
        count: room.count,
      })),
      equipment: createdProperty.equipment,
    };
  }
}