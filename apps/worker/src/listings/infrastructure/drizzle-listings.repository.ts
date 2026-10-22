import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type NodePgDatabase } from '@homie/db';
import type {
  PropertyData,
  PropertyUpdatedPayload,
  ListingBlob,
} from '@homie/events';
import { listings } from '@/database/schema/index';
import * as schema from '@/database/schema/index';
import { IListingsRepository } from '../domain/interface/listings.repository';

@Injectable()
export class DrizzleListingsRepository implements IListingsRepository {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async upsert(data: ListingBlob): Promise<void> {
    await this.db
      .insert(listings)
      .values({
        listingId: data.id,
        propertyId: data.propertyId,
        data,
      })
      .onConflictDoUpdate({
        target: listings.listingId,
        set: { propertyId: data.propertyId, data },
      });
  }

  async updateProperty(
    propertyId: string,
    property: PropertyUpdatedPayload,
  ): Promise<void> {
    const rows = await this.db
      .select()
      .from(listings)
      .where(eq(listings.propertyId, propertyId));

    for (const row of rows) {
      const data = row.data as ListingBlob;
      data.property = { ...data.property, ...property };

      await this.db
        .update(listings)
        .set({ data })
        .where(eq(listings.listingId, row.listingId));
    }
  }

  async getProperty(propertyId: string): Promise<PropertyData | null> {
    const [row] = await this.db
      .select()
      .from(listings)
      .where(eq(listings.propertyId, propertyId))
      .limit(1);

    if (!row) {
      return null;
    }

    return (row.data as ListingBlob).property;
  }

  async findById(id: string): Promise<ListingBlob | null> {
    const [row] = await this.db
      .select()
      .from(listings)
      .where(eq(listings.listingId, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return row.data as ListingBlob;
  }
}
