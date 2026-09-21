import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import {
  CreatePropertyDtoRequest,
  CreatePropertyDtoResponse,
  PropertyParamsDto,
  UpdatePropertyDtoRequest,
} from './dtos/properties.dto';
import { GoogleTokenGuard } from '@/api/auth/google-token.guard';
import { type Request } from 'express';

@Controller("properties")
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(GoogleTokenGuard)
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

  @Put(":propertyId")
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: "Update a property" })
  async updateProperty(
    @Req() request: Request,
    @Param() params: PropertyParamsDto,
    @Body() updatePropertyDto: UpdatePropertyDtoRequest,
  ): Promise<CreatePropertyDtoResponse> {
    return this.propertiesService.updateProperty(
      request.user!.userId,
      params.propertyId,
      updatePropertyDto,
    );
  }
}
