import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EQUIPMENT_REPOSITORY,
  type IEquipmentRepository,
} from '@/api/equipment/domain/interface/equipment.repository';
import {
  CreateEquipmentDtoRequest,
  EquipmentDtoResponse,
  PatchEquipmentDtoRequest,
} from '@/api/equipment/dtos/equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @Inject(EQUIPMENT_REPOSITORY)
    private readonly equipmentRepository: IEquipmentRepository,
  ) {}

  async createEquipment(
    data: CreateEquipmentDtoRequest,
  ): Promise<EquipmentDtoResponse> {
    return this.equipmentRepository.createPropertyEquipment(data);
  }

  async createEquipmentForProperty(
    propertyId: string,
    equipment: { equipmentType: string; count: number }[],
  ): Promise<EquipmentDtoResponse[]> {
    return Promise.all(
      equipment.map(item => this.equipmentRepository.createPropertyEquipment({
        propertyId,
        equipmentType: item.equipmentType,
        count: item.count,
      })),
    );
  }

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
