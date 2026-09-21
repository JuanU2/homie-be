import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = app.get(ConfigService);
  const port = Number(config.get('WORKER_PORT') ?? 3002);

  await app.listen(port);
  Logger.log(`Worker listening on ${port}`, 'Bootstrap');
}
bootstrap();
