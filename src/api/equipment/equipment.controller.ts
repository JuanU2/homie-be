import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  CreateEquipmentDtoRequest,
  EquipmentDtoResponse,
  PatchEquipmentDtoRequest,
} from '@/api/equipment/dtos/equipment.dto';
import { EquipmentService } from '@/api/equipment/equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create property equipment' })
  async createEquipment(
    @Body() data: CreateEquipmentDtoRequest,
  ): Promise<EquipmentDtoResponse> {
    return this.equipmentService.createEquipment(data);
  }

  @Patch(':propertyId/:equipmentType')
  @ApiOperation({ summary: 'Patch property equipment quantity' })
  async patchEquipment(
    @Param('propertyId') propertyId: string,
    @Param('equipmentType') equipmentType: string,
    @Body() data: PatchEquipmentDtoRequest,
  ): Promise<EquipmentDtoResponse> {
    return this.equipmentService.patchEquipment(propertyId, equipmentType, data);
  }
}
