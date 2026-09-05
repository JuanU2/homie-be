import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { propertyImages, roommateRequests } from '@/db/schema';
import {
  CreateRoommateRequestModel,
  GetRoommateRequestsParams,
  RoommateRequest,
  type RoommateRequestCurrency,
  RoommateRequestListItem,
  RoommateRequestsPage,
} from '@/api/roommateRequests/domain/entity/roommateRequest';
import { IRoommateRequestsRepository } from '@/api/roommateRequests/domain/interface/roommateRequests.repository';
import { convertDbLocation } from '@/utils/locationUtil';

type RoommateRequestsSchema = {
  roommateRequests: typeof roommateRequests;
  propertyImages: typeof propertyImages;
};

interface RawPageRow {
  rrId: string;
  maxRoommates: number;
  currentRoommates: number;
  priceAmount: number;
  priceCurrency: string;
  createdAt: string;
  propertyId: string;
  description: string;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  location: string;
  distance: number | null;
}

function encodeCursor(key: string, id: string): string {
  return Buffer.from(JSON.stringify({ key, id })).toString('base64url');
}

function decodeCursor(cursor: string): { key: string; id: string } {
  const parsed = JSON.parse(
    Buffer.from(cursor, 'base64url').toString('utf8'),
  ) as { key: string; id: string };
  return { key: parsed.key, id: parsed.id };
}

@Injectable()
export class DrizzleRoommateRequestsRepository
  implements IRoommateRequestsRepository
{
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<RoommateRequestsSchema>,
  ) {}

  async createRoommateRequest(
    request: CreateRoommateRequestModel,
  ): Promise<RoommateRequest> {
    const [createdRequest] = await this.db
      .insert(roommateRequests)
      .values({
        propertyId: request.propertyId,
        createdBy: request.createdBy,
        description: request.description,
        priceAmount: request.priceAmount,
        priceCurrency: request.priceCurrency,
        idealMoveInDate: request.idealMoveInDate ?? null,
        maxRoommates: request.maxRoommates,
        currentRoommates: request.currentRoommates,
      })
      .returning();

    if (!createdRequest) {
      throw new Error('Failed to create roommate request');
    }

    return createdRequest;
  }

  async getRoommateRequestById(id: string): Promise<RoommateRequest | undefined> {
    return this.db.query.roommateRequests.findFirst({
      where: requests => eq(requests.id, id),
    });
  }

  async getRoommateRequestsPage(
    params: GetRoommateRequestsParams,
  ): Promise<RoommateRequestsPage> {
    const { limit, cursor, lat, lng } = params;
    const hasLocation = lat !== undefined && lng !== undefined;

    const rows = hasLocation
      ? await this.queryByDistance(limit, cursor, lat, lng)
      : await this.queryByRecency(limit, cursor);

    const propertyIds = rows.map(row => row.propertyId);
    const titleImageIdByProperty =
      await this.getTitleImageIdByProperty(propertyIds);

    const items = rows.map(row => this.toListItem(row, titleImageIdByProperty));

    const hasNext = rows.length > limit;
    const pageItems = hasNext ? items.slice(0, limit) : items;
    const lastRow = hasNext ? rows[limit - 1] : undefined;
    const nextCursor =
      hasNext && lastRow
        ? encodeCursor(
            hasLocation
              ? String(lastRow.distance)
              : lastRow.createdAt,
            lastRow.rrId,
          )
        : null;

    return { items: pageItems, nextCursor };
  }

  private async queryByRecency(
    limit: number,
    cursor?: string,
  ): Promise<RawPageRow[]> {
    let where = sql``;
    if (cursor) {
      const { key, id } = decodeCursor(cursor);
      where = sql`WHERE (rr.created_at, rr.id) < (${key}, ${id})`;
    }

    const result = await this.db.execute(sql`
      SELECT
        rr.id AS "rrId",
        rr.max_roommates AS "maxRoommates",
        rr.current_roommates AS "currentRoommates",
        rr.price_amount AS "priceAmount",
        rr.price_currency AS "priceCurrency",
        rr.created_at AS "createdAt",
        p.id AS "propertyId",
        p.description AS "description",
        p.country AS "country",
        p.city AS "city",
        p.zip_code AS "zipCode",
        p.street AS "street",
        p.street_number AS "streetNumber",
        p.location AS "location",
        NULL::float8 AS "distance"
      FROM roommate_requests rr
      JOIN properties p ON p.id = rr.property_id
      ${where}
      ORDER BY rr.created_at DESC, rr.id DESC
      LIMIT ${limit + 1}
    `);

    return result.rows as unknown as RawPageRow[];
  }

  private async queryByDistance(
    limit: number,
    cursor: string | undefined,
    lat: number,
    lng: number,
  ): Promise<RawPageRow[]> {
    let where = sql``;
    if (cursor) {
      const { key, id } = decodeCursor(cursor);
      where = sql`WHERE (sub.distance, sub.rrId) > (${Number(key)}, ${id})`;
    }

    const result = await this.db.execute(sql`
      SELECT sub.*
      FROM (
        SELECT
          rr.id AS "rrId",
          rr.max_roommates AS "maxRoommates",
          rr.current_roommates AS "currentRoommates",
          rr.price_amount AS "priceAmount",
          rr.price_currency AS "priceCurrency",
          rr.created_at AS "createdAt",
          p.id AS "propertyId",
          p.description AS "description",
          p.country AS "country",
          p.city AS "city",
          p.zip_code AS "zipCode",
          p.street AS "street",
          p.street_number AS "streetNumber",
          p.location AS "location",
          ST_Distance(
            p.location,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS distance
        FROM roommate_requests rr
        JOIN properties p ON p.id = rr.property_id
      ) sub
      ${where}
      ORDER BY sub.distance ASC, sub.rrId ASC
      LIMIT ${limit + 1}
    `);

    return result.rows as unknown as RawPageRow[];
  }

  private async getTitleImageIdByProperty(
    propertyIds: string[],
  ): Promise<Record<string, string>> {
    if (propertyIds.length === 0) return {};

    const rows = await this.db
      .select({ propertyId: propertyImages.propertyId, id: propertyImages.id })
      .from(propertyImages)
      .where(
        and(
          inArray(propertyImages.propertyId, propertyIds),
          eq(propertyImages.title, true),
        ),
      );

    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.propertyId] = row.id;
    }
    return result;
  }

  private toListItem(
    row: RawPageRow,
    titleImageIdByProperty: Record<string, string>,
  ): RoommateRequestListItem {
    const location = convertDbLocation(row.location);
    return {
      id: row.rrId,
      maxRoommates: row.maxRoommates,
      currentRoommates: row.currentRoommates,
      priceAmount: row.priceAmount,
      priceCurrency: row.priceCurrency as RoommateRequestCurrency,
      property: {
        id: row.propertyId,
        description: row.description,
        country: row.country,
        city: row.city,
        zipCode: row.zipCode,
        street: row.street,
        streetNumber: row.streetNumber,
        lat: location?.lat ?? 0,
        lng: location?.lng ?? 0,
        titleImageId: titleImageIdByProperty[row.propertyId] ?? null,
      },
    };
  }
}
