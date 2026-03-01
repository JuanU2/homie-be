import { Inject, Injectable } from '@nestjs/common';
import { PROPERTIES_REPOSITORY, type IPropertiesRepository } from '@/properties/domain/interface/properties.repository';
import { CreatePropertyDtoRequest, CreatePropertyDtoResponse } from './dtos/properties.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: IPropertiesRepository,
  ) {}

  async createProperty(createPropertyDto: CreatePropertyDtoRequest): Promise<CreatePropertyDtoResponse> {
    const property = await this.propertiesRepository.createProperty(
      createPropertyDto
    );

    return {
      ...property,
      sizeM2: property.sizeM2 ?? undefined,
    };
  }
}