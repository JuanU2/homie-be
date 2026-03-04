import { Module } from "@nestjs/common";
import { UsersController } from "@/users/users.controller";
import { UsersService } from "@/users/users.service";
import { DrizzleUserRepository } from "@/users/infrastructure/drizzle-user.repository";
import { USER_REPOSITORY } from "@/users/domain/interface/user.repository";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as schema from "@/db/schema";
import { AuthService } from '@/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/auth/auth.controller';
import { UserSettingsService } from '@/userSettings/userSettings.service';
import { USER_SETTINGS_REPOSITORY } from '@/userSettings/domain/interface/userSettings.repository';
import { DrizzleUserSetttingsRepository } from '@/userSettings/infrastructure/drizzle-userSettings.repository';
import { UserSettingsController } from '@/userSettings/userSettings.controller';
import { JwtStrategy } from '@/auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [UsersController, AuthController, UserSettingsController],
  providers: [
    UsersService,
    AuthService,
    UserSettingsService,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
    {
      provide: USER_SETTINGS_REPOSITORY,
      useClass: DrizzleUserSetttingsRepository,
    },
    {
      provide: "DRIZZLE_DB",
      useFactory: async (): Promise<NodePgDatabase<typeof schema>> => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        return drizzle(pool, { schema });
      },
    },
  ],
})
export class AppModule {}
