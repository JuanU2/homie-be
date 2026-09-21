import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleTokenGuard } from './google-token.guard';

@Global()
@Module({
  providers: [
    GoogleTokenGuard,
    {
      provide: 'GOOGLE_AUTH_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new OAuth2Client(config.get<string>('GOOGLE_CLIENT_ID')),
    },
  ],
  exports: ['GOOGLE_AUTH_CLIENT', GoogleTokenGuard],
})
export class AuthModule {}
