import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/api/auth/jwt-auth.guard';
import {
  CreateDeviceTokenDtoRequest,
  DeviceTokenDtoResponse,
} from '@/api/deviceTokens/dtos/deviceTokens.dto';
import { DeviceTokensService } from '@/api/deviceTokens/deviceTokens.service';

@Controller('device-tokens')
export class DeviceTokensController {
  constructor(private readonly deviceTokensService: DeviceTokensService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a device token for push notifications' })
  async registerDeviceToken(
    @Req() request: Request,
    @Body() data: CreateDeviceTokenDtoRequest,
  ): Promise<DeviceTokenDtoResponse> {
    return this.deviceTokensService.registerToken(
      request.user!.userId,
      data.token,
    );
  }
}
