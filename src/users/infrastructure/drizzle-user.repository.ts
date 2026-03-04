import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { IUserRepository } from "@/users/domain/interface/user.repository";
import { UserWithSettings } from '@/users/domain/entity/user.entity';
import { eq } from 'drizzle-orm';
import { users, userSettings } from '@/db/schema';
import * as schema from '@/db/schema';
  

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(
    @Inject("DRIZZLE_DB")
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getUserById(id: string): Promise<UserWithSettings | undefined> {
    const user = await this.db.query.users.findFirst({
      where: users => eq(users.id, id),
      with: {
        userSettings: true,
      },
    });

    if (!user || !user.userSettings) {
    return undefined;
  }

    return {
      ...user,
      userSettings: user.userSettings,
    };
  }

  async getUserByEmail(email: string): Promise<UserWithSettings | undefined> {
    const user = await this.db.query.users.findFirst({
      where: users => eq(users.email, email),
      with: {
        userSettings: true,
      },
    });

    if (!user?.userSettings) {
      return undefined;
    }

    return {
      ...user,
      userSettings: user.userSettings,
    };
  }

    async createUser(
    name: string,
    email: string,
    image: string
  ): Promise<UserWithSettings> {
    return await this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email,
          fullName: name,
          image,
        })
        .returning();

      const [settings] = await tx
        .insert(userSettings)
        .values({
          userId: user.id,
        })
        .returning();

      return {
        ...user,
        userSettings: settings,
      };
    });
  }

  async findOrCreateGoogleUser(name: string, email: string, image: string): Promise<UserWithSettings> {
    return this.db.transaction(async (tx) => {
      let user = await tx.query.users.findFirst({
        where: users => eq(users.email, email),
        with: {
          userSettings: true,
        },
      });

      if (!user) {
        user = await this.createUser(name, email, image);
      }

      if (!user.userSettings) {
        throw new Error('Error creating user');
      }

      return {
        ...user,
        userSettings: user.userSettings,
      };
    });
  }
}
