import { Module } from '@nestjs/common';
import { DrizzleRoommateRequestsRepository } from './infrastructure/drizzle-roommate-requests.repository';
import { ROOMMATE_REQUESTS_REPOSITORY } from './domain/interface/roommate-requests.repository';

@Module({
  providers: [
    {
      provide: ROOMMATE_REQUESTS_REPOSITORY,
      useClass: DrizzleRoommateRequestsRepository,
    },
  ],
  exports: [ROOMMATE_REQUESTS_REPOSITORY],
})
export class RoommateRequestsModule {}
