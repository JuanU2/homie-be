import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENTS_EXCHANGE } from '@homie/events';
import { EventPublisher } from './event.publisher';
import { EVENTS_CLIENT } from './messaging.constants';

@Module({
  imports: [
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
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class MessagingModule {}
