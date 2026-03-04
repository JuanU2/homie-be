import { User, UserWithSettings } from "@/users/domain/entity/user.entity";

export interface IUserRepository {
  getUserById(id: string): Promise<UserWithSettings | undefined>;
  getUserByEmail(email: string): Promise<UserWithSettings | undefined>;
  findOrCreateGoogleUser(name: string, email: string, image: string): Promise<UserWithSettings>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");