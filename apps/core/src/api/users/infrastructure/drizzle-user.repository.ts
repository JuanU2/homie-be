import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { IUserRepository } from "@/api/users/domain/interface/user.repository";
import { UserWithSettings } from '@/api/users/domain/entity/user.entity';
import { eq } from 'drizzle-orm';
import { users, userSettings } from '@/db/schema/index';
import * as schema from '@/db/schema/index';
  

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

  async getUserByGoogleSub(
    googleSub: string,
  ): Promise<UserWithSettings | undefined> {
    const user = await this.db.query.users.findFirst({
      where: (u) => eq(u.googleSub, googleSub),
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

  async findOrCreateGoogleUser(
    googleSub: string,
    name: string,
    email: string,
    image: string,
  ): Promise<UserWithSettings> {
    return this.db.transaction(async (tx) => {
      let user = await tx.query.users.findFirst({
        where: (u) => eq(u.googleSub, googleSub),
        with: {
          userSettings: true,
        },
      });

      if (!user) {
        // Legacy migration: match existing rows by email and backfill google_sub.
        user = await tx.query.users.findFirst({
          where: (u) => eq(u.email, email),
          with: {
            userSettings: true,
          },
        });

        if (user) {
          const [updated] = await tx
            .update(users)
            .set({ googleSub })
            .where(eq(users.id, user.id))
            .returning();
          user = { ...updated, userSettings: user.userSettings };
        }
      }

      if (!user) {
        const [created] = await tx
          .insert(users)
          .values({ googleSub, email, fullName: name, image })
          .returning();

        const [settings] = await tx
          .insert(userSettings)
          .values({ userId: created.id })
          .returning();

        user = { ...created, userSettings: settings };
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
