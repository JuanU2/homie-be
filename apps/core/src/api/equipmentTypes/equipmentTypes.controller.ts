import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { EquipmentTypesService } from './equipmentTypes.service';
import { EquipmentTypeResponseDto } from './dtos/equipmentTypes.dto';

@Controller('equipment-types')
export class EquipmentTypesController {
  constructor(private readonly equipmentTypesService: EquipmentTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all equipment types' })
  async getAll(): Promise<EquipmentTypeResponseDto[]> {
    return this.equipmentTypesService.getAll();
  }
}
