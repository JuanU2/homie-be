import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from './interface/auth.repository';

import { AuthUserDtoRequest } from './dtos/auth.dto';

@Injectable()
export class AuthService {

  private client: OAuth2Client;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {

    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
    );

  }

  async authenticateUser(
    data: AuthUserDtoRequest,
  ): Promise<string> {

    try {

      const ticket = await this.client.verifyIdToken({

        idToken: data.idToken,

        audience: process.env.GOOGLE_CLIENT_ID,

      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {

        throw new UnauthorizedException(
          'Invalid Google token',
        );

      }


      return this.authRepository.authenticateUser({

        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        image: payload.picture,

      });

    } catch {

      throw new UnauthorizedException(
        'Google authentication failed',
      );

    }

  }

}