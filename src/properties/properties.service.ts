import { Inject, Injectable } from '@nestjs/common';
import { PROPERTIES_REPOSITORY, type IPropertiesRepository } from '@/properties/domain/interface/properties.repository';
import { Property } from '@/properties/domain/entity/property';
import { CreatePropertyDtoRequest } from './dtos/properties.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: IPropertiesRepository,
  ) {}

  async createProperty(createPropertyDto: CreatePropertyDtoRequest): Promise<Property> {
    return this.propertiesRepository.createProperty(createPropertyDto);
  }
}