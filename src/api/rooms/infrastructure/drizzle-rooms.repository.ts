import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { propertyRooms } from '@/db/schema';
import { CreateRoomModel, PatchRoomModel, Room } from '@/api/rooms/domain/entity/room';
import { IRoomsRepository } from '@/api/rooms/domain/interface/rooms.repository';

type RoomsSchema = { propertyRooms: typeof propertyRooms };

@Injectable()
export class DrizzleRoomsRepository implements IRoomsRepository {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<RoomsSchema>,
  ) {}

  async createRoom(
    room: CreateRoomModel,
    dbClient?: NodePgDatabase<any>,
  ): Promise<Room> {
    const client = dbClient ?? this.db;

    const [createdRoom] = await client
      .insert(propertyRooms)
      .values({
        propertyId: room.propertyId,
        roomType: room.roomType,
        count: room.count,
      })
      .returning();

    if (!createdRoom) {
      throw new Error('Failed to create room');
    }

    return createdRoom;
  }

  async patchRoom(
    id: string,
    room: PatchRoomModel,
    dbClient?: NodePgDatabase<any>,
  ): Promise<Room | undefined> {
    const client = dbClient ?? this.db;

    const [updatedRoom] = await client
      .update(propertyRooms)
      .set({
        ...(room.roomType ? { roomType: room.roomType } : {}),
        ...(room.count ? { count: room.count } : {}),
      })
      .where(eq(propertyRooms.id, id))
      .returning();

    return updatedRoom;
  }
}
