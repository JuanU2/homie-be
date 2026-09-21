import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import type { OAuth2Client } from 'google-auth-library';

import { AuthUserDtoRequest, AuthUserDtoResponse } from './dtos/auth.dto';
import { USER_REPOSITORY, type IUserRepository } from '@/api/users/domain/interface/user.repository';
import { userMapper } from '@/api/users/userMapper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject('GOOGLE_AUTH_CLIENT')
    private readonly client: OAuth2Client,

    private readonly config: ConfigService,
  ) {}

  /**
   * Verifies a Google ID token and returns the matching user. No backend JWT
   * is issued — clients send the Google ID token on every request and the
   * GoogleTokenGuard validates it against Google's public keys.
   */
  async authenticateUser(
    data: AuthUserDtoRequest,
  ): Promise<AuthUserDtoResponse> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: data.idToken,
        audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload?.sub || !payload?.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      this.logger.log(
        `ID token verified: email=${payload.email}, sub=${payload.sub}, aud=${payload.aud}`,
      );

      const user = await this.userRepository.findOrCreateGoogleUser(
        payload.sub,
        payload.name ?? payload.email,
        payload.email,
        payload.picture ?? '',
      );
      this.logger.log(`User resolved: id=${user.id}, email=${user.email}`);

      return {
        user: userMapper(user),
      };
    } catch (e) {
      this.logger.error(
        'Google authentication failed',
        e instanceof Error ? e.stack : String(e),
      );
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
