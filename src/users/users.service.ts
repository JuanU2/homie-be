import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "./domain/interface/user.repository";
import { User } from '@/users/domain/entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.getAllUsers();
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.userRepository.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.getUserByEmail(email);
  }
}