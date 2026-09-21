import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Request } from 'express';
import type { OAuth2Client } from 'google-auth-library';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/api/users/domain/interface/user.repository';

@Injectable()
export class GoogleTokenGuard implements CanActivate {
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
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid access token');
      }

      const user = await this.userRepository.getUserByGoogleSub(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Unknown user');
      }

      request.user = { userId: user.id, email: user.email };
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return undefined;
    }
    return header.slice(7).trim();
  }
}
