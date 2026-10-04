import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { type NodePgDatabase } from '@homie/db';
import { aiUsage } from '@/database/schema/index';
import * as schema from '@/database/schema/index';

@Injectable()
export class UsageLimitService {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Atomically records one usage for `feature` by `sub` today and returns
   * whether the call is allowed. The `WHERE count < limit` clause in the
   * conflict update makes this race-free: once the counter reaches the limit,
   * concurrent increments match zero rows and are rejected.
   */
  async consume(sub: string, feature: string, limit: number): Promise<boolean> {
    const rows = await this.db
      .insert(aiUsage)
      .values({ sub, feature, day: sql`CURRENT_DATE`, count: 1 })
      .onConflictDoUpdate({
        target: [aiUsage.sub, aiUsage.feature, aiUsage.day],
        set: { count: sql`${aiUsage.count} + 1` },
        setWhere: sql`${aiUsage.count} < ${limit}`,
      })
      .returning({ count: aiUsage.count });

    return rows.length > 0;
  }
}
