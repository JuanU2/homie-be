import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GoogleTokenGuard } from '@/api/auth/google-token.guard';
import { EquipmentTypesService } from './equipmentTypes.service';
import {
  CreateEquipmentTypeDtoRequest,
  EquipmentTypeResponseDto,
} from './dtos/equipmentTypes.dto';

@Controller('equipment-types')
export class EquipmentTypesController {
  constructor(private readonly equipmentTypesService: EquipmentTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all equipment types' })
  async getAll(): Promise<EquipmentTypeResponseDto[]> {
    return this.equipmentTypesService.getAll();
  }

  @Post()
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Create equipment type' })
  async create(
    @Body() data: CreateEquipmentTypeDtoRequest,
  ): Promise<EquipmentTypeResponseDto> {
    return this.equipmentTypesService.createEquipmentType(data.name);
  }
}
