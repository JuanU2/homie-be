import { Body, Controller, Param, Patch, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UpdateUserSettingsDtoRequest, UpdateUserSettingsDtoResponse, UserSettingsParamsDto } from '@/api/userSettings/dtos/userSettings.dto';
import { UserSettingsService } from '@/api/userSettings/userSettings.service';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/api/auth/jwt-auth.guard';
import { type Request } from 'express';

@Controller('user-settings')
export class UserSettingsController {

  constructor(private userSettingsService: UserSettingsService) {}

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(@Req() request: Request, @Param() params: UserSettingsParamsDto, @Body() data: UpdateUserSettingsDtoRequest): Promise<UpdateUserSettingsDtoResponse> {
    if (request.user?.userId !== params.id) {
      throw new UnauthorizedException("You can only update your own settings");
    }
    return this.userSettingsService.updateSettings(params.id, data);
  }
}