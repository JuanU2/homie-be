import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  CreateRoomDtoRequest,
  PatchRoomDtoRequest,
  RoomDtoResponse,
  RoomParamsDto,
} from '@/api/rooms/dtos/rooms.dto';
import { RoomsService } from '@/api/rooms/rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create room' })
  async createRoom(@Body() data: CreateRoomDtoRequest): Promise<RoomDtoResponse> {
    return this.roomsService.createRoom(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Patch room' })
  async patchRoom(
    @Param() params: RoomParamsDto,
    @Body() data: PatchRoomDtoRequest,
  ): Promise<RoomDtoResponse> {
    return this.roomsService.patchRoom(params.id, data);
  }
}
