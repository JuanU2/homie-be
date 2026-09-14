import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROPERTIES_REPOSITORY, type IPropertiesRepository } from '@/api/properties/domain/interface/properties.repository';
import { CreatePropertyDtoRequest, CreatePropertyDtoResponse, roomTypeEnum, UpdatePropertyDtoRequest } from './dtos/properties.dto';

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

  async updateProperty(
    userId: string,
    propertyId: string,
    updatePropertyDto: UpdatePropertyDtoRequest,
  ): Promise<CreatePropertyDtoResponse> {
    const ownerId = await this.propertiesRepository.getOwnerId(propertyId);
    if (!ownerId) {
      throw new NotFoundException('Property not found');
    }
    if (ownerId !== userId) {
      throw new ForbiddenException('You can only update your own property');
    }

    const updatedProperty = await this.propertiesRepository.updateProperty(
      propertyId,
      {
        description: updatePropertyDto.description,
        sizeM2: updatePropertyDto.sizeM2,
        roomCount: updatePropertyDto.roomCount,
        country: updatePropertyDto.country,
        city: updatePropertyDto.city,
        zipCode: updatePropertyDto.zipCode,
        street: updatePropertyDto.street,
        streetNumber: updatePropertyDto.streetNumber,
        lat: updatePropertyDto.lat,
        lng: updatePropertyDto.lng,
        rooms: updatePropertyDto.rooms,
        equipment: updatePropertyDto.equipment,
      },
    );

    if (!updatedProperty) {
      throw new NotFoundException('Property not found');
    }

    return {
      id: updatedProperty.property.id,
      ownerId: updatedProperty.property.ownerId,
      description: updatedProperty.property.description,
      sizeM2: updatedProperty.property.sizeM2 ?? undefined,
      roomCount: updatedProperty.property.roomCount,
      country: updatedProperty.property.country,
      city: updatedProperty.property.city,
      zipCode: updatedProperty.property.zipCode,
      street: updatedProperty.property.street,
      streetNumber: updatedProperty.property.streetNumber,
      lat: updatePropertyDto.lat,
      lng: updatePropertyDto.lng,
      createdAt: updatedProperty.property.createdAt,
      updatedAt: updatedProperty.property.updatedAt,
      rooms: updatedProperty.rooms.map(room => ({
        roomType: room.roomType as roomTypeEnum,
        count: room.count,
      })),
      equipment: updatedProperty.equipment,
    };
  }
}