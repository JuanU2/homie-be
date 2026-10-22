import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENTS_EXCHANGE } from '@homie/events';
import { AiModule } from '@/ai/ai.module';
import { PropertyInsightsModule } from '@/property-insights/property-insights.module';
import { ListingsModule } from '@/listings/listings.module';
import { EquipmentTypeConsumer } from './equipment-type.consumer';
import { ListingConsumer } from './listing.consumer';
import { EventPublisher } from './event.publisher';
import { EVENTS_CLIENT } from './messaging.constants';

@Module({
  imports: [
    AiModule,
    ListingsModule,
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
  controllers: [EquipmentTypeConsumer, ListingConsumer],
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class MessagingModule {}
