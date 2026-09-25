import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import type { NextFunction, Request, Response } from 'express';
import { EVENTS_EXCHANGE } from '@homie/events';
import { AppModule } from './app.module';

function summarizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const clone: Record<string, unknown> = {
    ...(body as Record<string, unknown>),
  };
  for (const [key, value] of Object.entries(clone)) {
    if (typeof value === 'string' && value.length > 200) {
      clone[key] = `<string length ${value.length}>`;
    }
  }
  return clone;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useBodyParser('json', { limit: '25mb' });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const bodyLog =
        req.method !== 'GET' && req.body
          ? ` | body=${JSON.stringify(summarizeBody(req.body))}`
          : '';
      Logger.log(
        `${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)${bodyLog}`,
        'Request',
      );
    });
    next();
  });

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
      noAck: true,
    },
  });
  await app.startAllMicroservices();

  await app.listen(port);
  Logger.log(`Worker listening on ${port}`, 'Bootstrap');
}
bootstrap();
