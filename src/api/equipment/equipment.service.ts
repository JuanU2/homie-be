import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EQUIPMENT_REPOSITORY,
  type IEquipmentRepository,
} from '@/api/equipment/domain/interface/equipment.repository';
import {
  EquipmentDtoResponse,
  PatchEquipmentDtoRequest,
} from '@/api/equipment/dtos/equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @Inject(EQUIPMENT_REPOSITORY)
    private readonly equipmentRepository: IEquipmentRepository,
  ) {}

  async patchEquipment(
    propertyId: string,
    equipmentType: string,
    data: PatchEquipmentDtoRequest,
  ): Promise<EquipmentDtoResponse> {
    const equipment = await this.equipmentRepository.patchPropertyEquipment({
      propertyId,
      equipmentType,
      count: data.count,
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found for property');
    }

    return equipment;
  }
}
