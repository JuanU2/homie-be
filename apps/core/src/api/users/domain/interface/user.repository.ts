import { User, UserWithSettings } from "@/api/users/domain/entity/user.entity";

export interface IUserRepository {
  getUserById(id: string): Promise<UserWithSettings | undefined>;
  getUserByEmail(email: string): Promise<UserWithSettings | undefined>;
  getUserByGoogleSub(googleSub: string): Promise<UserWithSettings | undefined>;
  findOrCreateGoogleUser(
    googleSub: string,
    name: string,
    email: string,
    image: string,
  ): Promise<UserWithSettings>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");