import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type NodePgDatabase } from '@homie/db';
import { propertyInsights } from '@/database/schema/index';
import * as schema from '@/database/schema/index';
import type { PropertyInsights } from '../dtos/property-insights.dto';
import { IPropertyInsightsRepository } from '../domain/interface/property-insights.repository';

@Injectable()
export class DrizzlePropertyInsightsRepository
  implements IPropertyInsightsRepository
{
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async upsert(propertyId: string, insight: PropertyInsights): Promise<void> {
    await this.db
      .insert(propertyInsights)
      .values({ propertyId, insight })
      .onConflictDoUpdate({
        target: propertyInsights.propertyId,
        set: { insight, updatedAt: new Date() },
      });
  }

  async get(propertyId: string): Promise<PropertyInsights | null> {
    const [row] = await this.db
      .select()
      .from(propertyInsights)
      .where(eq(propertyInsights.propertyId, propertyId))
      .limit(1);

    return row ? (row.insight as PropertyInsights) : null;
  }
}
