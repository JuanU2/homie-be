import { Module } from "@nestjs/common";
import { UsersController } from "@/api/users/users.controller";
import { UsersService } from "@/api/users/users.service";
import { DrizzleUserRepository } from "@/api/users/infrastructure/drizzle-user.repository";
import { USER_REPOSITORY } from "@/api/users/domain/interface/user.repository";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as schema from "@/db/schema";
import { AuthService } from '@/api/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/api/auth/auth.controller';
import { UserSettingsService } from '@/api/userSettings/userSettings.service';
import { USER_SETTINGS_REPOSITORY } from '@/api/userSettings/domain/interface/userSettings.repository';
import { DrizzleUserSetttingsRepository } from '@/api/userSettings/infrastructure/drizzle-userSettings.repository';
import { UserSettingsController } from '@/api/userSettings/userSettings.controller';
import { JwtStrategy } from '@/api/auth/jwt.strategy';
import { PropertiesController } from '@/api/properties/properties.controller';
import { PropertiesService } from '@/api/properties/properties.service';
import { PROPERTIES_REPOSITORY } from '@/api/properties/domain/interface/properties.repository';
import { PropertiesRepository } from '@/api/properties/infrastructure/drizzle-properties.repository';
import { RoomsController } from '@/api/rooms/rooms.controller';
import { RoomsService } from '@/api/rooms/rooms.service';
import { ROOMS_REPOSITORY } from '@/api/rooms/domain/interface/rooms.repository';
import { DrizzleRoomsRepository } from '@/api/rooms/infrastructure/drizzle-rooms.repository';
import { EquipmentController } from '@/api/equipment/equipment.controller';
import { EquipmentService } from '@/api/equipment/equipment.service';
import { EQUIPMENT_REPOSITORY } from '@/api/equipment/domain/interface/equipment.repository';
import { DrizzleEquipmentRepository } from '@/api/equipment/infrastructure/drizzle-equipment.repository';
import { RoommateRequestsController } from '@/api/roommateRequests/roommateRequests.controller';
import { RoommateRequestsService } from '@/api/roommateRequests/roommateRequests.service';
import { ROOMMATE_REQUESTS_REPOSITORY } from '@/api/roommateRequests/domain/interface/roommateRequests.repository';
import { DrizzleRoommateRequestsRepository } from '@/api/roommateRequests/infrastructure/drizzle-roommateRequests.repository';
import { EquipmentTypesController } from '@/api/equipmentTypes/equipmentTypes.controller';
import { EquipmentTypesService } from '@/api/equipmentTypes/equipmentTypes.service';
import { EQUIPMENT_TYPES_REPOSITORY } from '@/api/equipmentTypes/domain/interface/equipmentTypes.repository';
import { DrizzleEquipmentTypesRepository } from '@/api/equipmentTypes/infrastructure/drizzle-equipmentTypes.repository';
import { PropertyImagesController } from '@/api/propertyImages/propertyImages.controller';
import { PropertyImagesService } from '@/api/propertyImages/propertyImages.service';
import { PROPERTY_IMAGES_REPOSITORY } from '@/api/propertyImages/domain/interface/propertyImages.repository';
import { DrizzlePropertyImagesRepository } from '@/api/propertyImages/infrastructure/drizzle-propertyImages.repository';
import { StorageService } from '@/storage/storage.service';

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
  controllers: [
    UsersController,
    AuthController,
    UserSettingsController,
    PropertiesController,
    RoomsController,
    EquipmentController,
    RoommateRequestsController,
    EquipmentTypesController,
    PropertyImagesController,
  ],
  providers: [
    UsersService,
    AuthService,
    UserSettingsService,
    PropertiesService,
    RoomsService,
    EquipmentService,
    RoommateRequestsService,
    EquipmentTypesService,
    PropertyImagesService,
    StorageService,
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
      provide: PROPERTIES_REPOSITORY,
      useClass: PropertiesRepository,
    },
    {
      provide: ROOMS_REPOSITORY,
      useClass: DrizzleRoomsRepository,
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
      provide: EQUIPMENT_TYPES_REPOSITORY,
      useClass: DrizzleEquipmentTypesRepository,
    },
    {
      provide: PROPERTY_IMAGES_REPOSITORY,
      useClass: DrizzlePropertyImagesRepository,
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
