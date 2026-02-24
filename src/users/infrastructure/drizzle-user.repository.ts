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
}
