import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GoogleTokenGuard } from '@/auth/google-token.guard';
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
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Get property insights' })
  async getInsights(
    @Param() params: PropertyInsightsParamsDto,
  ): Promise<PropertyInsights> {
    return this.propertyInsightsService.getForProperty(params.propertyId);
  }
}
