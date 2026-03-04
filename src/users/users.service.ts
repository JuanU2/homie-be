import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type IUserRepository,
} from "@/users/domain/interface/user.repository";
import { GetUserDtoResponse } from './dtos/users.dto';
import { userMapper } from './userMapper';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async getUserById(id: string): Promise<GetUserDtoResponse | undefined> {
    const user = await this.userRepository.getUserById(id);
    console.log("User from repository:", user);
    
    if (!user) {
      return undefined;
    }

    return userMapper(user);
  }

  async getUserByEmail(email: string): Promise<GetUserDtoResponse | undefined> {
    const user = await this.userRepository.getUserByEmail(email);
    
    if (!user) {
      return undefined;
    }

    return userMapper(user);
  }
}