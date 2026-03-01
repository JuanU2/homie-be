import { Module } from "@nestjs/common";
import { UsersController } from "@/users/users.controller";
import { UsersService } from "@/users/users.service";
import { DrizzleUserRepository } from "@/users/infrastructure/drizzle-user.repository";
import { USER_REPOSITORY } from "@/users/domain/interface/user.repository";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ConfigModule } from "@nestjs/config";
import * as schema from "@/db/schema";
import { AuthService } from '@/auth/auth.service';
import { jwtConstants } from '@/auth/constants';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { 
        expiresIn: '7d' 
      },
    })
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    AuthService,
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
