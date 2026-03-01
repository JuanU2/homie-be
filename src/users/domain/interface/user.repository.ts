import { User } from "@/users/domain/entity/user.entity";

export interface UserRepository {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  findOrCreateGoogleUser(name: string, email: string, image: string): Promise<User>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");