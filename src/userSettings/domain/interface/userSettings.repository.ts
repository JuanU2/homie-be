import { UserSettings } from '@/userSettings/domain/entity/userSettings';

export interface IUserSettingsRepository {
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;
}

export const USER_SETTINGS_REPOSITORY = Symbol("USER_SETTINGS_REPOSITORY");