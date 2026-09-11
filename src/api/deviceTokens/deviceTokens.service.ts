import { Inject, Injectable } from '@nestjs/common';
import type { DeviceToken } from '@/api/deviceTokens/domain/entity/deviceToken';
import { DEVICE_TOKENS_REPOSITORY } from '@/api/deviceTokens/domain/interface/deviceTokens.repository';
import type { IDeviceTokensRepository } from '@/api/deviceTokens/domain/interface/deviceTokens.repository';

@Injectable()
export class DeviceTokensService {
  constructor(
    @Inject(DEVICE_TOKENS_REPOSITORY)
    private readonly deviceTokensRepository: IDeviceTokensRepository,
  ) {}

  registerToken(userId: string, token: string): Promise<DeviceToken> {
    return this.deviceTokensRepository.upsert(userId, token);
  }

  getTokens(userId: string): Promise<string[]> {
    return this.deviceTokensRepository.getTokensByUserId(userId);
  }
}
