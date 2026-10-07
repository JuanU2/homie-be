import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ClientProxy } from '@nestjs/microservices';
import { EVENTS_CLIENT } from './messaging.constants';

@Injectable()
export class EventPublisher {
  constructor(
    @Inject(EVENTS_CLIENT) private readonly client: ClientProxy,
  ) {}

  async publish<TEventType extends string>(
    eventType: TEventType,
    routingKey: string,
    payload: unknown,
    version = 1,
  ): Promise<void> {
    const event = {
      eventId: randomUUID(),
      eventType,
      occurredAt: new Date().toISOString(),
      version,
      payload,
    };

    this.client.emit(routingKey, event);
  }
}
