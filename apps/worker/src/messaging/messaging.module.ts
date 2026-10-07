import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENTS_EXCHANGE } from '@homie/events';
import { AiModule } from '@/ai/ai.module';
import { PropertyInsightsModule } from '@/property-insights/property-insights.module';
import { RoommateRequestsModule } from '@/roommate-requests/roommate-requests.module';
import { EquipmentTypeConsumer } from './equipment-type.consumer';
import { RoommateRequestConsumer } from './roommate-request.consumer';
import { EventPublisher } from './event.publisher';
import { EVENTS_CLIENT } from './messaging.constants';

@Module({
  imports: [
    AiModule,
    RoommateRequestsModule,
    PropertyInsightsModule,
    ClientsModule.registerAsync([
      {
        name: EVENTS_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            exchange: EVENTS_EXCHANGE,
            exchangeType: 'topic',
            wildcards: true,
            persistent: true,
          },
        }),
      },
    ]),
  ],
  controllers: [EquipmentTypeConsumer, RoommateRequestConsumer],
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class MessagingModule {}
