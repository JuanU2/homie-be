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
import { AuthService } from "@/api/auth/auth.service";
import { OAuth2Client } from "google-auth-library";
import { GoogleTokenGuard } from "@/api/auth/google-token.guard";
import { OptionalGoogleTokenGuard } from "@/api/auth/optional-google-token.guard";
import { AuthController } from "@/api/auth/auth.controller";
import { UserSettingsService } from "@/api/userSettings/userSettings.service";
import { USER_SETTINGS_REPOSITORY } from "@/api/userSettings/domain/interface/userSettings.repository";
import { DrizzleUserSetttingsRepository } from "@/api/userSettings/infrastructure/drizzle-userSettings.repository";
import { UserSettingsController } from "@/api/userSettings/userSettings.controller";
import { PropertiesController } from "@/api/properties/properties.controller";
import { PropertiesService } from "@/api/properties/properties.service";
import { PROPERTIES_REPOSITORY } from "@/api/properties/domain/interface/properties.repository";
import { PropertiesRepository } from "@/api/properties/infrastructure/drizzle-properties.repository";
import { EquipmentController } from "@/api/equipment/equipment.controller";
import { EquipmentService } from "@/api/equipment/equipment.service";
import { EQUIPMENT_REPOSITORY } from "@/api/equipment/domain/interface/equipment.repository";
import { DrizzleEquipmentRepository } from "@/api/equipment/infrastructure/drizzle-equipment.repository";
import { ListingsController } from "@/api/listings/listings.controller";
import { UserListingsController } from "@/api/listings/userListings.controller";
import { ListingsService } from "@/api/listings/listings.service";
import { LISTINGS_REPOSITORY } from "@/api/listings/domain/interface/listings.repository";
import { DrizzleListingsRepository } from "@/api/listings/infrastructure/drizzle-listings.repository";
import { RoommateApplicationsController } from "@/api/roommateApplications/roommateApplications.controller";
import { UserRoommateApplicationsController } from "@/api/roommateApplications/userRoommateApplications.controller";
import { RoommateApplicationsService } from "@/api/roommateApplications/roommateApplications.service";
import { RoommateApplicationStatusProcessor } from "@/api/roommateApplications/roommateApplicationStatusProcessor";
import { RoommateApplicationPushService } from "@/api/roommateApplications/roommateApplicationPushService";
import { ROOMMATE_APPLICATIONS_REPOSITORY } from "@/api/roommateApplications/domain/interface/roommateApplications.repository";
import { DrizzleRoommateApplicationsRepository } from "@/api/roommateApplications/infrastructure/drizzle-roommateApplications.repository";
import { EquipmentTypesController } from "@/api/equipmentTypes/equipmentTypes.controller";
import { EquipmentTypesService } from "@/api/equipmentTypes/equipmentTypes.service";
import { EQUIPMENT_TYPES_REPOSITORY } from "@/api/equipmentTypes/domain/interface/equipmentTypes.repository";
import { DrizzleEquipmentTypesRepository } from "@/api/equipmentTypes/infrastructure/drizzle-equipmentTypes.repository";
import { PropertyImagesController } from "@/api/propertyImages/propertyImages.controller";
import { PropertyImagesService } from "@/api/propertyImages/propertyImages.service";
import { PROPERTY_IMAGES_REPOSITORY } from "@/api/propertyImages/domain/interface/propertyImages.repository";
import { DrizzlePropertyImagesRepository } from "@/api/propertyImages/infrastructure/drizzle-propertyImages.repository";
import { StorageService } from "@/storage/storage.service";
import { DeviceTokensController } from "@/api/deviceTokens/deviceTokens.controller";
import { DeviceTokensService } from "@/api/deviceTokens/deviceTokens.service";
import { DEVICE_TOKENS_REPOSITORY } from "@/api/deviceTokens/domain/interface/deviceTokens.repository";
import { DrizzleDeviceTokensRepository } from "@/api/deviceTokens/infrastructure/drizzle-deviceTokens.repository";
import { PushService } from "@/push/push.service";
import { MessagingModule } from "@/messaging/messaging.module";
import { PointsOfInterestConsumer } from "@/api/pointsOfInterest/points-of-interest.consumer";
import { POINTS_OF_INTEREST_REPOSITORY } from "@/api/pointsOfInterest/domain/interface/points-of-interest.repository";
import { DrizzlePointsOfInterestRepository } from "@/api/pointsOfInterest/infrastructure/drizzle-points-of-interest.repository";
import { FavouritesController } from "@/api/favourites/favourites.controller";
import { FavouritesService } from "@/api/favourites/favourites.service";
import { FAVOURITES_REPOSITORY } from "@/api/favourites/domain/interface/favourites.repository";
import { DrizzleFavouritesRepository } from "@/api/favourites/infrastructure/drizzle-favourites.repository";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    MessagingModule,
  ],
  controllers: [
    UsersController,
    AuthController,
    UserSettingsController,
    PropertiesController,
    EquipmentController,
    ListingsController,
    UserListingsController,
    RoommateApplicationsController,
    UserRoommateApplicationsController,
    EquipmentTypesController,
    PropertyImagesController,
    DeviceTokensController,
    PointsOfInterestConsumer,
    FavouritesController,
  ],
  providers: [
    UsersService,
    AuthService,
    UserSettingsService,
    PropertiesService,
    EquipmentService,
    ListingsService,
    RoommateApplicationsService,
    RoommateApplicationStatusProcessor,
    RoommateApplicationPushService,
    EquipmentTypesService,
    PropertyImagesService,
    StorageService,
    DeviceTokensService,
    PushService,
    FavouritesService,
    GoogleTokenGuard,
    OptionalGoogleTokenGuard,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: "GOOGLE_AUTH_CLIENT",
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new OAuth2Client(config.get<string>("GOOGLE_CLIENT_ID")),
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
      provide: LISTINGS_REPOSITORY,
      useClass: DrizzleListingsRepository,
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
      provide: POINTS_OF_INTEREST_REPOSITORY,
      useClass: DrizzlePointsOfInterestRepository,
    },
    {
      provide: FAVOURITES_REPOSITORY,
      useClass: DrizzleFavouritesRepository,
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
