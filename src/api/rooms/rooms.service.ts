import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IRoomsRepository,
  ROOMS_REPOSITORY,
} from '@/api/rooms/domain/interface/rooms.repository';
import {
  CreateRoomDtoRequest,
  PatchRoomDtoRequest,
  RoomDtoResponse,
  roomTypeEnum,
} from '@/api/rooms/dtos/rooms.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class RoomsService {
  constructor(
    @Inject(ROOMS_REPOSITORY)
    private readonly roomsRepository: IRoomsRepository,
  ) {}

  async createRoom(
    data: CreateRoomDtoRequest,
    dbClient?: NodePgDatabase<any>,
  ): Promise<RoomDtoResponse> {
    const room = await this.roomsRepository.createRoom(data, dbClient);

    return {
      id: room.id,
      propertyId: room.propertyId,
      roomType: room.roomType as roomTypeEnum,
      count: room.count,
    };
  }

  async createRoomsForProperty(
    propertyId: string,
    rooms: { roomType: CreateRoomDtoRequest['roomType']; count: number }[],
    dbClient?: NodePgDatabase<any>,
  ): Promise<RoomDtoResponse[]> {
    return Promise.all(
      rooms.map(room => this.createRoom({
        propertyId,
        roomType: room.roomType,
        count: room.count,
      }, dbClient)),
    );
  }

  async patchRoom(
    id: string,
    data: PatchRoomDtoRequest,
    dbClient?: NodePgDatabase<any>,
  ): Promise<RoomDtoResponse> {
    const room = await this.roomsRepository.patchRoom(id, data, dbClient);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return {
      id: room.id,
      propertyId: room.propertyId,
      roomType: room.roomType as roomTypeEnum,
      count: room.count,
    };
  }
}
