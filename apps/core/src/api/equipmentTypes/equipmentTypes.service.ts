import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPMENT_TYPES_REPOSITORY,
  type IEquipmentTypesRepository,
} from './domain/interface/equipmentTypes.repository';
import { EquipmentTypeResponseDto } from './dtos/equipmentTypes.dto';

@Injectable()
export class EquipmentTypesService {
  constructor(
    @Inject(EQUIPMENT_TYPES_REPOSITORY)
    private readonly equipmentTypesRepository: IEquipmentTypesRepository,
  ) {}

  async getAll(): Promise<EquipmentTypeResponseDto[]> {
    return this.equipmentTypesRepository.getAll();
  }
}
