import { Body, Controller, Patch } from '@nestjs/common';
import { UpdateUserSettingsDtoRequest, UpdateUserSettingsDtoResponse } from '@/userSettings/dtos/userSettings.dto';
import { UserSettingsService } from '@/userSettings/userSettings.service';

@Controller('user-settings')
export class UserSettingsController {

  constructor(private userSettingsService: UserSettingsService) {}

  @Patch(":id")
  async updateSettings(id: string, @Body() data: UpdateUserSettingsDtoRequest): Promise<UpdateUserSettingsDtoResponse> {
    return this.userSettingsService.updateSettings(id, data);
  }
}