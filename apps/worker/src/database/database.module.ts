import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { createDb, type Database } from '@homie/db';

@Global()
@Module({
  providers: [
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
  exports: ['DRIZZLE_DB'],
})
export class DatabaseModule {}
