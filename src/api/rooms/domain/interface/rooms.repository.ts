import { CreateRoomModel, PatchRoomModel, Room } from '@/api/rooms/domain/entity/room';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface IRoomsRepository {
  createRoom(room: CreateRoomModel, dbClient?: NodePgDatabase<any>): Promise<Room>;
  patchRoom(
    id: string,
    room: PatchRoomModel,
    dbClient?: NodePgDatabase<any>,
  ): Promise<Room | undefined>;
}

export const ROOMS_REPOSITORY = Symbol('ROOMS_REPOSITORY');
