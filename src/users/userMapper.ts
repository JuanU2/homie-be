import { UserWithSettings } from '@/users/domain/entity/user.entity';
import { GetUserDtoResponse } from './dtos/users.dto';
import wkx from "wkx";

export const userMapper = (user: UserWithSettings): GetUserDtoResponse => {
  const wkbHex = user.userSettings.idealLocation;

  let idealLocation: { lat: number; lng: number } | null = null;

  if (wkbHex) {
    const buffer = Buffer.from(wkbHex, "hex");
    const point = wkx.Geometry.parse(buffer) as wkx.Point;
    idealLocation = { lat: point.y, lng: point.x };
  }
  
  return {
    ...user,
    userSettings: {
      ...user.userSettings,
      idealLocation: user.userSettings.idealLocation
        ? idealLocation
        : null,
    }
  };
}