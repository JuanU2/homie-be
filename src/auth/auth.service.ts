import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { OAuth2Client } from 'google-auth-library';

import { AuthUserDtoRequest } from './dtos/auth.dto';
import { USER_REPOSITORY, type UserRepository } from '@/users/domain/interface/user.repository';

@Injectable()
export class AuthService {

  private client: OAuth2Client;

  constructor(

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    private readonly jwtService: JwtService,

  ) {

    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
    );

  }

  /**
   * 
   * This function authenticate google user and return a JWT token if the authentication is successful. 
   * It verifies the Google ID token, retrieves the user's email from the token payload, and either finds or creates a user in the database. 
   * Finally, it generates a JWT token containing the user's ID and email.
   * 
   * @param data 
   * @returns 
   */

  async authenticateUser(
    data: AuthUserDtoRequest,
  ): Promise<string> {

    try {

      const ticket =
        await this.client.verifyIdToken({

          idToken: data.idToken,

          audience: process.env.GOOGLE_CLIENT_ID,

        });

      const payload = ticket.getPayload();

      if (!payload?.email) {

        throw new UnauthorizedException(
          'Invalid Google token',
        );

      }

      const user =
        await this.userRepository.findOrCreateGoogleUser(data.user.name,data.user.email, data.user.image);

      const token =
        await this.jwtService.signAsync({

          userId: user.id,
          email: user.email,

        });

      return token;

    } catch {

      throw new UnauthorizedException(
        'Google authentication failed',
      );

    }

  }

}