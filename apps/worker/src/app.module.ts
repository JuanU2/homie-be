import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { Pool } from 'pg';
import { createDb, type Database } from '@homie/db';
import { AiModule } from './ai/ai.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    AiModule,
    ScraperModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: 'DRIZZLE_DB',
      useFactory: async (): Promise<Database> => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        return createDb(pool);
      },
    },
  ],
})
export class AppModule {}
