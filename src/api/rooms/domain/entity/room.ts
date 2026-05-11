export type RoomType =
  | 'DORMITORY'
  | 'BATHROOM'
  | 'KITCHEN'
  | 'LIVING_ROOM'
  | 'TOILET'
  | 'WARDROBE'
  | 'BALCONY'
  | 'OTHER';

export interface Room {
  id: string;
  propertyId: string;
  roomType: RoomType;
  count: number;
}

export interface CreateRoomModel {
  propertyId: string;
  roomType: RoomType;
  count: number;
}

export interface PatchRoomModel {
  roomType?: RoomType;
  count?: number;
}
