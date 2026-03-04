import { Body, Controller, Param, Patch, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UpdateUserSettingsDtoRequest, UpdateUserSettingsDtoResponse } from '@/userSettings/dtos/userSettings.dto';
import { UserSettingsService } from '@/userSettings/userSettings.service';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { type Request } from 'express';

@Controller('user-settings')
export class UserSettingsController {

  constructor(private userSettingsService: UserSettingsService) {}

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(@Req() request: Request, @Param("id") id: string, @Body() data: UpdateUserSettingsDtoRequest): Promise<UpdateUserSettingsDtoResponse> {
    if (request.user?.userId !== id) {
      throw new UnauthorizedException("You can only update your own settings");
    }
    return this.userSettingsService.updateSettings(id, data);
  }
}