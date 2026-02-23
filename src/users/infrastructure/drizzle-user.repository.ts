import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { UserRepository } from "../domain/interface/user.repository";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @Inject("DRIZZLE_DB")
    private readonly db: NodePgDatabase,
  ) {}
}
