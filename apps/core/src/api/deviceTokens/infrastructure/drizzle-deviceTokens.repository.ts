import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { DeviceToken } from '@/api/deviceTokens/domain/entity/deviceToken';
import type { IDeviceTokensRepository } from '@/api/deviceTokens/domain/interface/deviceTokens.repository';
import { deviceTokens, schema } from '@homie/db';

@Injectable()
export class DrizzleDeviceTokensRepository implements IDeviceTokensRepository {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async upsert(userId: string, token: string): Promise<DeviceToken> {
    const [created] = await this.db
      .insert(deviceTokens)
      .values({ userId, token })
      .onConflictDoUpdate({
        target: deviceTokens.token,
        set: { userId, updatedAt: new Date() },
      })
      .returning();

    if (!created) {
      throw new Error('Failed to upsert device token');
    }

    return created;
  }

  async getTokensByUserId(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ token: deviceTokens.token })
      .from(deviceTokens)
      .where(eq(deviceTokens.userId, userId));

    return rows.map((row) => row.token);
  }

  async deleteByTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) {
      return;
    }

    await this.db
      .delete(deviceTokens)
      .where(inArray(deviceTokens.token, tokens));
  }
}
