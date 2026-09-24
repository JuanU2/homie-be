import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  EQUIPMENT_TYPE_CREATED_ROUTING_KEY,
  equipmentTypeCreatedEventSchema,
} from '@homie/events';
import { EQUIPMENT_TYPES_REPOSITORY } from '@/ai/domain/interface/equipment-types.repository';
import type { IEquipmentTypesRepository } from '@/ai/domain/interface/equipment-types.repository';

@Controller()
export class EquipmentTypeConsumer {
  private readonly logger = new Logger(EquipmentTypeConsumer.name);

  constructor(
    @Inject(EQUIPMENT_TYPES_REPOSITORY)
    private readonly equipmentTypesRepository: IEquipmentTypesRepository,
  ) {}

  @EventPattern(EQUIPMENT_TYPE_CREATED_ROUTING_KEY)
  async handleCreated(event: unknown): Promise<void> {
    const parsed = equipmentTypeCreatedEventSchema.safeParse(event);
    if (!parsed.success) {
      this.logger.warn('Discarding malformed EquipmentTypeCreated event');
      return;
    }

    await this.equipmentTypesRepository.upsert(parsed.data.payload.name);
  }
}
