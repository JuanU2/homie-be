import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
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
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5000', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

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

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
