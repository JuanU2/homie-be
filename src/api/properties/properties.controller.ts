import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import {
  CreatePropertyDtoRequest,
  CreatePropertyDtoResponse,
} from './dtos/properties.dto';
import { JwtAuthGuard } from '@/api/auth/jwt-auth.guard';
import { type Request } from 'express';

@Controller("properties")
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create a new property" })
  async createProperty(
    @Req() request: Request,
    @Body() createPropertyDto: CreatePropertyDtoRequest,
  ): Promise<CreatePropertyDtoResponse> {
    if (request.user?.userId !== createPropertyDto.ownerId) {
      throw new ForbiddenException(
        "You can only create a property for yourself",
      );
    }
    return this.propertiesService.createProperty(createPropertyDto);
  }
}
