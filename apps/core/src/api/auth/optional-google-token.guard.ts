import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Request } from 'express';
import type { OAuth2Client } from 'google-auth-library';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/api/users/domain/interface/user.repository';

@Injectable()
export class OptionalGoogleTokenGuard implements CanActivate {
  constructor(
    @Inject('GOOGLE_AUTH_CLIENT')
    private readonly client: OAuth2Client,
    private readonly config: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      return true;
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload?.sub) {
        return true;
      }

      const user = await this.userRepository.getUserByGoogleSub(payload.sub);
      if (!user) {
        return true;
      }

      request.user = { userId: user.id, email: user.email };
    } catch {
      // Keep the request anonymous when the token is missing or invalid.
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return undefined;
    }
    return header.slice(7).trim();
  }
}
