import { UserWithSettings } from '@/users/domain/entity/user.entity';
import { GetUserDtoResponse } from './dtos/users.dto';
import wkx from "wkx";
import { convertDbLocation } from '@/utils/locationUtil';

export const userMapper = (user: UserWithSettings): GetUserDtoResponse => {
  const wkbHex = user.userSettings.idealLocation;

  const idealLocation = convertDbLocation(wkbHex);
  
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