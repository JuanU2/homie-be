import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiAiApiService } from './infrastructure/gemini-ai-api.service';
import { DrizzleEquipmentTypesRepository } from './infrastructure/drizzle-equipment-types.repository';
import { AI_API_SERVICE } from './domain/interface/ai-api.service';
import { EQUIPMENT_TYPES_REPOSITORY } from './domain/interface/equipment-types.repository';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: 'GOOGLE_GEN_AI',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('GEMINI_API_KEY');
        return apiKey ? new GoogleGenAI({ apiKey }) : undefined;
      },
    },
    {
      provide: AI_API_SERVICE,
      useClass: GeminiAiApiService,
    },
    {
      provide: EQUIPMENT_TYPES_REPOSITORY,
      useClass: DrizzleEquipmentTypesRepository,
    },
  ],
  exports: [AiService, EQUIPMENT_TYPES_REPOSITORY],
})
export class AiModule {}
