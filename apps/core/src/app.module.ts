import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { UsersController } from "@/api/users/users.controller";
import { UsersService } from "@/api/users/users.service";
import { DrizzleUserRepository } from "@/api/users/infrastructure/drizzle-user.repository";
import { USER_REPOSITORY } from "@/api/users/domain/interface/user.repository";
import { Pool } from "pg";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createDb, type NodePgDatabase } from "@homie/db";
import * as schema from "@/db/schema/index";
import { AuthService } from '@/api/auth/auth.service';
import { OAuth2Client } from 'google-auth-library';
import { GoogleTokenGuard } from '@/api/auth/google-token.guard';
import { AuthController } from '@/api/auth/auth.controller';
import { UserSettingsService } from '@/api/userSettings/userSettings.service';
import { USER_SETTINGS_REPOSITORY } from '@/api/userSettings/domain/interface/userSettings.repository';
import { DrizzleUserSetttingsRepository } from '@/api/userSettings/infrastructure/drizzle-userSettings.repository';
import { UserSettingsController } from '@/api/userSettings/userSettings.controller';
import { PropertiesController } from '@/api/properties/properties.controller';
import { PropertiesService } from '@/api/properties/properties.service';
import { PROPERTIES_REPOSITORY } from '@/api/properties/domain/interface/properties.repository';
import { PropertiesRepository } from '@/api/properties/infrastructure/drizzle-properties.repository';
import { EquipmentController } from '@/api/equipment/equipment.controller';
import { EquipmentService } from '@/api/equipment/equipment.service';
import { EQUIPMENT_REPOSITORY } from '@/api/equipment/domain/interface/equipment.repository';
import { DrizzleEquipmentRepository } from '@/api/equipment/infrastructure/drizzle-equipment.repository';
import { RoommateRequestsController } from '@/api/roommateRequests/roommateRequests.controller';
import { UserRoommateRequestsController } from '@/api/roommateRequests/userRoommateRequests.controller';
import { RoommateRequestsService } from '@/api/roommateRequests/roommateRequests.service';
import { ROOMMATE_REQUESTS_REPOSITORY } from '@/api/roommateRequests/domain/interface/roommateRequests.repository';
import { DrizzleRoommateRequestsRepository } from '@/api/roommateRequests/infrastructure/drizzle-roommateRequests.repository';
import { RoommateApplicationsController } from '@/api/roommateApplications/roommateApplications.controller';
import { RoommateApplicationsService } from '@/api/roommateApplications/roommateApplications.service';
import { ROOMMATE_APPLICATIONS_REPOSITORY } from '@/api/roommateApplications/domain/interface/roommateApplications.repository';
import { DrizzleRoommateApplicationsRepository } from '@/api/roommateApplications/infrastructure/drizzle-roommateApplications.repository';
import { EquipmentTypesController } from '@/api/equipmentTypes/equipmentTypes.controller';
import { EquipmentTypesService } from '@/api/equipmentTypes/equipmentTypes.service';
import { EQUIPMENT_TYPES_REPOSITORY } from '@/api/equipmentTypes/domain/interface/equipmentTypes.repository';
import { DrizzleEquipmentTypesRepository } from '@/api/equipmentTypes/infrastructure/drizzle-equipmentTypes.repository';
import { PropertyImagesController } from '@/api/propertyImages/propertyImages.controller';
import { PropertyImagesService } from '@/api/propertyImages/propertyImages.service';
import { PROPERTY_IMAGES_REPOSITORY } from '@/api/propertyImages/domain/interface/propertyImages.repository';
import { DrizzlePropertyImagesRepository } from '@/api/propertyImages/infrastructure/drizzle-propertyImages.repository';
import { StorageService } from '@/storage/storage.service';
import { DeviceTokensController } from '@/api/deviceTokens/deviceTokens.controller';
import { DeviceTokensService } from '@/api/deviceTokens/deviceTokens.service';
import { DEVICE_TOKENS_REPOSITORY } from '@/api/deviceTokens/domain/interface/deviceTokens.repository';
import { DrizzleDeviceTokensRepository } from '@/api/deviceTokens/infrastructure/drizzle-deviceTokens.repository';
import { PushService } from '@/push/push.service';
import { MessagingModule } from '@/messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    MessagingModule,
  ],
  controllers: [
    UsersController,
    AuthController,
    UserSettingsController,
    PropertiesController,
    EquipmentController,
    RoommateRequestsController,
    UserRoommateRequestsController,
    RoommateApplicationsController,
    EquipmentTypesController,
    PropertyImagesController,
    DeviceTokensController,
  ],
  providers: [
    UsersService,
    AuthService,
    UserSettingsService,
    PropertiesService,
    EquipmentService,
    RoommateRequestsService,
    RoommateApplicationsService,
    EquipmentTypesService,
    PropertyImagesService,
    StorageService,
    DeviceTokensService,
    PushService,
    GoogleTokenGuard,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: 'GOOGLE_AUTH_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new OAuth2Client(config.get<string>('GOOGLE_CLIENT_ID')),
    },
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
    {
      provide: USER_SETTINGS_REPOSITORY,
      useClass: DrizzleUserSetttingsRepository,
    },
    {
      provide: PROPERTIES_REPOSITORY,
      useClass: PropertiesRepository,
    },
    {
      provide: EQUIPMENT_REPOSITORY,
      useClass: DrizzleEquipmentRepository,
    },
    {
      provide: ROOMMATE_REQUESTS_REPOSITORY,
      useClass: DrizzleRoommateRequestsRepository,
    },
    {
      provide: ROOMMATE_APPLICATIONS_REPOSITORY,
      useClass: DrizzleRoommateApplicationsRepository,
    },
    {
      provide: EQUIPMENT_TYPES_REPOSITORY,
      useClass: DrizzleEquipmentTypesRepository,
    },
    {
      provide: PROPERTY_IMAGES_REPOSITORY,
      useClass: DrizzlePropertyImagesRepository,
    },
    {
      provide: DEVICE_TOKENS_REPOSITORY,
      useClass: DrizzleDeviceTokensRepository,
    },
    {
      provide: "DRIZZLE_DB",
      useFactory: async (): Promise<NodePgDatabase<typeof schema>> => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        return createDb(pool, schema);
      },
    },
  ],
})
export class AppModule {}
