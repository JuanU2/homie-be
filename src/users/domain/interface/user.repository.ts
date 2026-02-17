import { CreateUserDtoRequest } from "src/users/dtos/users.dto";
import { User } from "../entity/user.entity";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDtoRequest, passwordHash: string): Promise<User>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
