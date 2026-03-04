import { UserWithSettings } from '@/users/domain/entity/user.entity';
import { GetUserDtoResponse } from './dtos/users.dto';

export const userMapper = (user: UserWithSettings): GetUserDtoResponse => {
  return {
    ...user,
    userSettings: {
      ...user.userSettings,
      idealLocation: user.userSettings.idealLocation
        ? {
            lat: parseFloat(user.userSettings.idealLocation.split(" ")[1].replace(")", "")),
            lng: parseFloat(user.userSettings.idealLocation.split(" ")[0].replace("POINT(", "")),
          }
        : null,
    }
  };
}