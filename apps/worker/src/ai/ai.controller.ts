import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GoogleTokenGuard } from '../auth/google-token.guard';
import { AiService } from './ai.service';
import {
  AnalyzePropertyImagesDto,
  type PropertyAnalysisResult,
  ScrapeListingDto,
  type ScrapeListingResult,
} from './dtos/ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  @ApiOperation({ summary: 'AI service health check' })
  health() {
    return { status: 'ok' };
  }

  @Post('property-analysis')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Analyze property photos with Gemini' })
  async analyzeProperty(
    @Body() dto: AnalyzePropertyImagesDto,
  ): Promise<PropertyAnalysisResult> {
    return this.aiService.analyzePropertyImages(
      dto.images,
      dto.language,
      dto.location,
    );
  }

  @Post('listing-scraping')
  @ApiOperation({ summary: 'Scrape a listing URL and extract structured data' })
  async scrapeListing(
    @Body() dto: ScrapeListingDto,
  ): Promise<ScrapeListingResult> {
    return this.aiService.scrapeListing(dto.url);
  }
}
