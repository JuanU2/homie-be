import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_METADATA = 'rate_limit';

export interface RateLimitOptions {
  feature: string;
  limit: number;
}

export const RateLimit = (feature: string, limit: number) =>
  SetMetadata(RATE_LIMIT_METADATA, { feature, limit } satisfies RateLimitOptions);
