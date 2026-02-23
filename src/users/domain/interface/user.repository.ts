import { CreateUserDtoRequest } from "src/users/dtos/users.dto";
import { User } from "@/users/domain/entity/user.entity";

export interface UserRepository {
  getAllUsers(): Promise<User[]>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
