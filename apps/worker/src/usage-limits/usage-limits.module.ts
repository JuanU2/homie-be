import { Global, Module } from '@nestjs/common';
import { UsageLimitService } from './usage-limits.service';
import { RateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  providers: [UsageLimitService, RateLimitGuard],
  exports: [UsageLimitService, RateLimitGuard],
})
export class UsageLimitsModule {}
