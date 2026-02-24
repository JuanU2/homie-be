import { Module } from "@nestjs/common";
import { UsersController } from "@/users/users.controller";
import { UsersService } from "@/users/users.service";
import { DrizzleUserRepository } from "@/users/infrastructure/drizzle-user.repository";
import { USER_REPOSITORY } from "@/users/domain/interface/user.repository";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ConfigModule } from "@nestjs/config";
import * as schema from "@/db/schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
    {
      provide: "DRIZZLE_DB",
      useFactory: async (): Promise<NodePgDatabase<typeof schema>> => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        return drizzle(pool);
      },
    },
  ],
})
export class AppModule {}
