import { User } from "@/users/domain/entity/user.entity";

export interface UserRepository {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
