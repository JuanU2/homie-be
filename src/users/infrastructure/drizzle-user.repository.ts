import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { users } from "../../db/schema";
import { UserRepository } from "../domain/interface/user.repository";
import { User } from "../domain/entity/user.entity";
import { CreateUserDtoRequest } from "../dtos/users.dto";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @Inject("DRIZZLE_DB")
    private readonly db: NodePgDatabase,
  ) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async create(
    data: CreateUserDtoRequest,
    passwordHash: string,
  ): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({ ...data, passwordHash })
      .returning();

    return result[0];
  }
}
