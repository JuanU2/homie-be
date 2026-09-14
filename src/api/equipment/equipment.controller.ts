import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  EquipmentDtoResponse,
  PatchEquipmentDtoRequest,
  PatchEquipmentParamsDto,
} from '@/api/equipment/dtos/equipment.dto';
import { EquipmentService } from '@/api/equipment/equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Patch(':propertyId/:equipmentType')
  @ApiOperation({ summary: 'Patch property equipment quantity' })
  async patchEquipment(
    @Param() params: PatchEquipmentParamsDto,
    @Body() data: PatchEquipmentDtoRequest,
  ): Promise<EquipmentDtoResponse> {
    return this.equipmentService.patchEquipment(
      params.propertyId,
      params.equipmentType,
      data,
    );
  }
}
