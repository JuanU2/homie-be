import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { EVENTS_EXCHANGE } from '@homie/events';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useBodyParser('json', { limit: '25mb' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Homie Worker API')
    .setDescription('AI (Google Gemini) property analysis API for the Homie app.')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const config = app.get(ConfigService);
  const port = Number(config.get('WORKER_PORT') ?? 3002);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
      queue: 'worker.events',
      queueOptions: { durable: true },
      exchange: EVENTS_EXCHANGE,
      exchangeType: 'topic',
      wildcards: true,
      noAck: false,
    },
  });
  await app.startAllMicroservices();

  await app.listen(port);
  Logger.log(`Worker listening on ${port}`, 'Bootstrap');
}
bootstrap();
