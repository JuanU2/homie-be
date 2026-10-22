import { Module } from '@nestjs/common';
import { DrizzleListingsRepository } from './infrastructure/drizzle-listings.repository';
import { LISTINGS_REPOSITORY } from './domain/interface/listings.repository';

@Module({
  providers: [
    {
      provide: LISTINGS_REPOSITORY,
      useClass: DrizzleListingsRepository,
    },
  ],
  exports: [LISTINGS_REPOSITORY],
})
export class ListingsModule {}
