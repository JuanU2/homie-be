import { Module } from '@nestjs/common';
import { AiModule } from '@/ai/ai.module';
import { PropertyInsightsModule } from '@/property-insights/property-insights.module';
import { RoommateRequestsModule } from '@/roommate-requests/roommate-requests.module';
import { EquipmentTypeConsumer } from './equipment-type.consumer';
import { RoommateRequestConsumer } from './roommate-request.consumer';

@Module({
  imports: [AiModule, RoommateRequestsModule, PropertyInsightsModule],
  controllers: [EquipmentTypeConsumer, RoommateRequestConsumer],
})
export class MessagingModule {}
