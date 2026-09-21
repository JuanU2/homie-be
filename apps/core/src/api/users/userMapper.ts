import { UserWithSettings } from '@/api/users/domain/entity/user.entity';
import { GetUserDtoResponse } from './dtos/users.dto';
import { convertDbLocation } from '@/utils/locationUtil';

export const userMapper = (user: UserWithSettings): GetUserDtoResponse => {
  const idealLocation = convertDbLocation(user.userSettings.idealLocation);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    image: user.image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    userSettings: {
      ...user.userSettings,
      idealLocation: user.userSettings.idealLocation ? idealLocation : null,
    },
  };
}