import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UsageLimitService } from './usage-limits.service';
import {
  RATE_LIMIT_METADATA,
  type RateLimitOptions,
} from './rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usageLimitService: UsageLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const sub = request.user?.sub;
    if (!sub) {
      return true;
    }

    const allowed = await this.usageLimitService.consume(
      sub,
      options.feature,
      options.limit,
    );

    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          feature: options.feature,
          message: `Daily limit reached for ${options.feature} (${options.limit} per day). Please try again tomorrow.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
