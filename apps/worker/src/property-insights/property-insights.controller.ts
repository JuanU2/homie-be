import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PropertyInsightsService } from './property-insights.service';
import {
  PropertyInsightsParamsDto,
  type PropertyInsights,
} from './dtos/property-insights.dto';

@Controller('ai/properties')
export class PropertyInsightsController {
  constructor(
    private readonly propertyInsightsService: PropertyInsightsService,
  ) {}

  @Get(':propertyId/insights')
  @ApiOperation({ summary: 'Get property insights' })
  async getInsights(
    @Param() params: PropertyInsightsParamsDto,
  ): Promise<PropertyInsights> {
    return this.propertyInsightsService.getForProperty(params.propertyId);
  }
}
