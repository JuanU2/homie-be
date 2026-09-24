import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPMENT_TYPE_CREATED_EVENT_TYPE,
  EQUIPMENT_TYPE_CREATED_ROUTING_KEY,
} from '@homie/events';
import {
  EQUIPMENT_TYPES_REPOSITORY,
  type IEquipmentTypesRepository,
} from './domain/interface/equipmentTypes.repository';
import { EquipmentTypeResponseDto } from './dtos/equipmentTypes.dto';
import { EventPublisher } from '@/messaging/event.publisher';

@Injectable()
export class EquipmentTypesService {
  constructor(
    @Inject(EQUIPMENT_TYPES_REPOSITORY)
    private readonly equipmentTypesRepository: IEquipmentTypesRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async getAll(): Promise<EquipmentTypeResponseDto[]> {
    return this.equipmentTypesRepository.getAll();
  }

  async createEquipmentType(name: string): Promise<EquipmentTypeResponseDto> {
    const created = await this.equipmentTypesRepository.create(name);

    await this.eventPublisher.publish(
      EQUIPMENT_TYPE_CREATED_EVENT_TYPE,
      EQUIPMENT_TYPE_CREATED_ROUTING_KEY,
      { name: created.name },
    );

    return created;
  }
}
