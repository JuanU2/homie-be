import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiGenerateDto } from './dtos/ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('generate')
  async generate(@Body() dto: AiGenerateDto) {
    const text = await this.aiService.generate(dto.prompt);
    return { text };
  }
}
