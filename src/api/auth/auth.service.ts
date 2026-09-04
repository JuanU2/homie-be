import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { OAuth2Client } from 'google-auth-library';

import { AuthUserDtoRequest, AuthUserDtoResponse } from './dtos/auth.dto';
import { USER_REPOSITORY, type IUserRepository } from '@/api/users/domain/interface/user.repository';
import { userMapper } from '@/api/users/userMapper';

@Injectable()
export class AuthService {

  private client: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

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
  ): Promise<AuthUserDtoResponse> {
    this.logger.log(
      `Authenticating user: email=${data.user.email}, name=${data.user.name}`,
    );

    try {
      this.logger.log(
        `Verifying Google ID token (audience=${process.env.GOOGLE_CLIENT_ID})`,
      );

      const ticket = await this.client.verifyIdToken({
        idToken: data.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      this.logger.log(
        `ID token verified: email=${payload?.email}, sub=${payload?.sub}, aud=${payload?.aud}, exp=${payload?.exp}`,
      );

      if (!payload?.email || payload.email !== data.user.email) {
        this.logger.warn(
          `Email mismatch: token=${payload?.email}, body=${data.user.email}`,
        );
        throw new UnauthorizedException('Invalid Google token');
      }

      const user = await this.userRepository.findOrCreateGoogleUser(
        data.user.name,
        data.user.email,
        data.user.image,
      );
      this.logger.log(`User resolved: id=${user.id}, email=${user.email}`);

      const token = await this.jwtService.signAsync({
        userId: user.id,
        email: user.email,
      });
      this.logger.log(`JWT issued for userId=${user.id}`);

      const mappedUser = userMapper(user);

      return {
        token,
        user: mappedUser,
      };
    } catch (e) {
      this.logger.error(
        'Google authentication failed',
        e instanceof Error ? e.stack : String(e),
      );
      throw new UnauthorizedException('Google authentication failed');
    }
  }

}
