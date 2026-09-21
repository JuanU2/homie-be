import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScrapeDto } from './dtos/scraper.dto';
import { GoogleTokenGuard } from '../auth/google-token.guard';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('scrape')
  @UseGuards(GoogleTokenGuard)
  async scrape(@Body() dto: ScrapeDto) {
    return this.scraperService.scrape(dto.url, dto.selector);
  }
}
