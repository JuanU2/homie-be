import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, initializeApp } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private app: App | undefined;

  constructor(config: ConfigService) {
    const credentialsPath = config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (!credentialsPath) {
      this.logger.warn(
        'GOOGLE_APPLICATION_CREDENTIALS is not set — push notifications are disabled.',
      );
      return;
    }

    this.app = initializeApp({
      credential: cert(credentialsPath),
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
    } catch (e) {
      this.logger.error(
        'Failed to send push',
        e instanceof Error ? e.stack : String(e),
      );
    }
  }
}
