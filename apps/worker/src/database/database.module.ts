import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { createDb, type NodePgDatabase } from '@homie/db';
import * as schema from '@/database/schema/index';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_DB',
      useFactory: async (): Promise<NodePgDatabase<typeof schema>> => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        return createDb(pool, schema);
      },
    },
  ],
  exports: ['DRIZZLE_DB'],
})
export class DatabaseModule {}
