import { Module } from '@nestjs/common';
import { AiModule } from '@/ai/ai.module';
import { GeocodingModule } from '@/geocoding/geocoding.module';
import { PropertyInsightsService } from './property-insights.service';
import { PropertyInsightsController } from './property-insights.controller';
import { DrizzlePropertyInsightsRepository } from './infrastructure/drizzle-property-insights.repository';
import { PROPERTY_INSIGHTS_REPOSITORY } from './domain/interface/property-insights.repository';

@Module({
  imports: [AiModule, GeocodingModule],
  controllers: [PropertyInsightsController],
  providers: [
    PropertyInsightsService,
    {
      provide: PROPERTY_INSIGHTS_REPOSITORY,
      useClass: DrizzlePropertyInsightsRepository,
    },
  ],
  exports: [PropertyInsightsService],
})
export class PropertyInsightsModule {}
