import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { App, cert, initializeApp } from 'firebase-admin/app';
import {
  getMessaging,
  MulticastMessage,
  SendResponse,
} from 'firebase-admin/messaging';
import { DEVICE_TOKENS_REPOSITORY } from '@/api/deviceTokens/domain/interface/deviceTokens.repository';
import type { IDeviceTokensRepository } from '@/api/deviceTokens/domain/interface/deviceTokens.repository';

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Error codes that mean a registration token can never be delivered to again,
// so it should be removed from the database.
const INVALID_TOKEN_ERROR_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
  'messaging/mismatched-credential',
]);

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private app: App | undefined;

  constructor(
    config: ConfigService,
    @Inject(DEVICE_TOKENS_REPOSITORY)
    private readonly deviceTokensRepository: IDeviceTokensRepository,
  ) {
    const credentialsPath = config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (!credentialsPath) {
      this.logger.warn(
        'GOOGLE_APPLICATION_CREDENTIALS is not set — push notifications are disabled.',
      );
      return;
    }

    this.app = initializeApp({
      credential: cert(
        path.isAbsolute(credentialsPath)
          ? credentialsPath
          : path.resolve(process.cwd(), '../../', credentialsPath),
      ),
    });
  }

  async send(tokens: string[], message: PushMessage): Promise<void> {
    if (!this.app) {
      this.logger.warn('Skipping push: Firebase Admin is not initialized.');
      return;
    }
    if (tokens.length === 0) {
      return;
    }

    const payload: MulticastMessage = {
      tokens,
      notification: { title: message.title, body: message.body },
      data: message.data,
    };

    try {
      const response = await getMessaging(this.app).sendEachForMulticast(
        payload,
      );
      this.logger.log(
        `Push sent: success=${response.successCount}, failure=${response.failureCount}`,
      );

      await this.deleteInvalidTokens(tokens, response.responses);
    } catch (e) {
      this.logger.error(
        'Failed to send push',
        e instanceof Error ? e.stack : String(e),
      );
    }
  }

  private async deleteInvalidTokens(
    tokens: string[],
    responses: SendResponse[],
  ): Promise<void> {
    const invalidTokens = tokens.filter(
      (_, i) =>
        !responses[i]?.success &&
        responses[i]?.error !== undefined &&
        INVALID_TOKEN_ERROR_CODES.has(responses[i].error!.code),
    );

    if (invalidTokens.length === 0) {
      return;
    }

    try {
      await this.deviceTokensRepository.deleteByTokens(invalidTokens);
      this.logger.log(
        `Deleted ${invalidTokens.length} invalid device token(s).`,
      );
    } catch (e) {
      this.logger.error(
        'Failed to delete invalid device tokens',
        e instanceof Error ? e.stack : String(e),
      );
    }
  }
}
