import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { UserRepository } from "../domain/interface/user.repository";
import { User } from '@/users/domain/entity/user.entity';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';

type UserSchema = { users: typeof users };
  
@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @Inject("DRIZZLE_DB")
    private readonly db: NodePgDatabase<UserSchema>,
  ) {}

  async getAllUsers(): Promise<User[]>  {
    return this.db.query.users.findMany();
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: users => eq(users.id, id),
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: users => eq(users.email, email),
    });
  }

  async findOrCreateGoogleUser(name: string, email: string, image: string): Promise<User> {
    return this.db.transaction(async (tx) => {
      let user = await tx.query.users.findFirst({
        where: users => eq(users.email, email),
      });

      if (!user) {
        const [createdUser] = await tx.insert(users).values({
          email,
          fullName: name,
          image: image
        }).returning();

        user = createdUser;
      }

      return user;
    });
  }
}
