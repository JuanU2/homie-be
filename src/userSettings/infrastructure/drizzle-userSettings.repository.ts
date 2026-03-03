import { userSettings } from '@/db/schema';
import { IUserSettingsRepository } from '@/userSettings/domain/interface/userSettings.repository';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import { UserSettings } from '@/userSettings/domain/entity/userSettings';
import { eq } from 'drizzle-orm';

type UserSettingsSchema = { userSettings: typeof userSettings };

export class DrizzleUserSetttingsRepository implements IUserSettingsRepository {

  constructor(
    @Inject("DRIZZLE_DB")
    private readonly db: NodePgDatabase<UserSettingsSchema>,
  ) {}

  
  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    const updateData: Partial<UserSettings> = {};
    if (settings.phoneNumber !== undefined) updateData.phoneNumber = settings.phoneNumber;
    if (settings.primaryInterest !== undefined) updateData.primaryInterest = settings.primaryInterest;
    if (settings.idealLocation !== undefined) updateData.idealLocation = settings.idealLocation;

    try {
      const [updatedSettings] = await this.db
        .update(userSettings)
        .set(updateData)
        .where(eq(userSettings.userId, userId))
        .returning();

      return updatedSettings;
    } catch (error) {
      console.error('Failed to update user settings', error);
      throw new InternalServerErrorException('Failed to update user settings');
    }
  }
}