import { Injectable, Inject } from '@nestjs/common';
import { UpdateUserSettingsDtoRequest, UpdateUserSettingsDtoResponse } from '@/userSettings/dtos/userSettings.dto';
import { USER_SETTINGS_REPOSITORY, type IUserSettingsRepository } from '@/userSettings/domain/interface/userSettings.repository';

@Injectable()
export class UserSettingsService {

  constructor(
    @Inject(USER_SETTINGS_REPOSITORY)
    private readonly userSettingsRepository: IUserSettingsRepository,
  ) {}
  
  async updateSettings(userId: string, data: UpdateUserSettingsDtoRequest): Promise<UpdateUserSettingsDtoResponse> {
    const updatedSettings = await this.userSettingsRepository.updateUserSettings(userId, {
      phoneNumber: data.phoneNumber,
      primaryInterest: data.primaryInterest,
      idealLocation: data.idealLocation ? `POINT(${data.idealLocation.lng} ${data.idealLocation.lat})` : undefined, 
    });

    return {
      userId: updatedSettings.userId,
    }
  }
}
