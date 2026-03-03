import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UpdateUserSettingsDtoRequest, UpdateUserSettingsDtoResponse } from '@/userSettings/dtos/userSettings.dto';
import { UserSettingsService } from '@/userSettings/userSettings.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('user-settings')
export class UserSettingsController {

  constructor(private userSettingsService: UserSettingsService) {}

  @Patch(":id")
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(@Param("id") id: string, @Body() data: UpdateUserSettingsDtoRequest): Promise<UpdateUserSettingsDtoResponse> {
    return this.userSettingsService.updateSettings(id, data);
  }
}