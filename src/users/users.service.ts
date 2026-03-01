import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type IUserRepository,
} from "@/users/domain/interface/user.repository";
import { CreateUserDtoResponse } from './dtos/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async getAllUsers(): Promise<CreateUserDtoResponse[]> {
    return this.userRepository.getAllUsers();
  }

  async getUserById(id: string): Promise<CreateUserDtoResponse | undefined> {
    return this.userRepository.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<CreateUserDtoResponse | undefined> {
    return this.userRepository.getUserByEmail(email);
  }
}