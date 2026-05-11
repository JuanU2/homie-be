import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDtoRequest, CreatePropertyDtoResponse } from './dtos/properties.dto';

@Controller("properties")
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new property" })
  async createProperty(@Body() createPropertyDto: CreatePropertyDtoRequest): Promise<CreatePropertyDtoResponse> {
    return this.propertiesService.createProperty(createPropertyDto);
  }
}
