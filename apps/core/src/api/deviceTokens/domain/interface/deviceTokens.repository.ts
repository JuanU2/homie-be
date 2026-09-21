import { DeviceToken } from '@/api/deviceTokens/domain/entity/deviceToken';

export interface IDeviceTokensRepository {
  upsert(userId: string, token: string): Promise<DeviceToken>;
  getTokensByUserId(userId: string): Promise<string[]>;
  deleteByTokens(tokens: string[]): Promise<void>;
}

export const DEVICE_TOKENS_REPOSITORY = Symbol('DEVICE_TOKENS_REPOSITORY');
