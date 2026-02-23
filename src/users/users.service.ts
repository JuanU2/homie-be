import { Inject, Injectable } from "@nestjs/common";
import { hash } from "bcrypt";
import { CreateUserDtoRequest, CreateUserDtoResponse } from "./dtos/users.dto";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "./domain/interface/user.repository";

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(
    userData: CreateUserDtoRequest,
  ): Promise<CreateUserDtoResponse> {
    const passwordHash = await hash(userData.password, 12); // 12 = salt rounds

    return this.userRepository.create(userData, passwordHash);
  }
}
