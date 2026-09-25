import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type NodePgDatabase } from '@homie/db';
import type {
  PropertyData,
  PropertyUpdatedPayload,
  RoommateRequestBlob,
} from '@homie/events';
import { roommateRequests } from '@/database/schema/index';
import * as schema from '@/database/schema/index';
import { IRoommateRequestsRepository } from '../domain/interface/roommate-requests.repository';

@Injectable()
export class DrizzleRoommateRequestsRepository
  implements IRoommateRequestsRepository
{
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async upsert(data: RoommateRequestBlob): Promise<void> {
    await this.db
      .insert(roommateRequests)
      .values({
        roommateRequestId: data.id,
        propertyId: data.propertyId,
        data,
      })
      .onConflictDoUpdate({
        target: roommateRequests.roommateRequestId,
        set: { propertyId: data.propertyId, data },
      });
  }

  async updateProperty(
    propertyId: string,
    property: PropertyUpdatedPayload,
  ): Promise<void> {
    const rows = await this.db
      .select()
      .from(roommateRequests)
      .where(eq(roommateRequests.propertyId, propertyId));

    for (const row of rows) {
      const data = row.data as RoommateRequestBlob;
      data.property = { ...data.property, ...property };

      await this.db
        .update(roommateRequests)
        .set({ data })
        .where(eq(roommateRequests.roommateRequestId, row.roommateRequestId));
    }
  }

  async getProperty(propertyId: string): Promise<PropertyData | null> {
    const [row] = await this.db
      .select()
      .from(roommateRequests)
      .where(eq(roommateRequests.propertyId, propertyId))
      .limit(1);

    if (!row) {
      return null;
    }

    return (row.data as RoommateRequestBlob).property;
  }
}
