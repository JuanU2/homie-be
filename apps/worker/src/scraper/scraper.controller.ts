import { Body, Controller, Get, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScrapeDto } from './dtos/scraper.dto';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('scrape')
  async scrape(@Body() dto: ScrapeDto) {
    return this.scraperService.scrape(dto.url, dto.selector);
  }
}
