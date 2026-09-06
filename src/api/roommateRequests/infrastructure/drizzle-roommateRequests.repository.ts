import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  equipmentTypes,
  properties,
  propertyEquipment,
  propertyImages,
  propertyRooms,
  roommateRequests,
  userSettings,
  users,
} from '@/db/schema';
import * as schema from '@/db/schema';
import {
  CreateRoommateRequestModel,
  GetRoommateRequestsParams,
  RoommateRequest,
  type RoommateRequestCurrency,
  RoommateRequestDetail,
  RoommateRequestListItem,
  RoommateRequestOwnerProfile,
  RoommateRequestPropertyDetail,
  RoommateRequestsPage,
} from '@/api/roommateRequests/domain/entity/roommateRequest';
import { IRoommateRequestsRepository } from '@/api/roommateRequests/domain/interface/roommateRequests.repository';
import { convertDbLocation } from '@/utils/locationUtil';

interface RawPageRow {
  rrId: string;
  maxRoommates: number;
  currentRoommates: number;
  priceAmount: number;
  priceCurrency: string;
  createdAt: string;
  propertyId: string;
  title: string;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  location: string;
  titleImageId: string | null;
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
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createRoommateRequest(
    request: CreateRoommateRequestModel,
  ): Promise<RoommateRequest> {
    const [createdRequest] = await this.db
      .insert(roommateRequests)
      .values({
        propertyId: request.propertyId,
        createdBy: request.createdBy,
        title: request.title,
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

  async getRoommateRequestDetail(
    id: string,
  ): Promise<RoommateRequestDetail | undefined> {
    const request = await this.getRoommateRequestById(id);

    if (!request) {
      return undefined;
    }

    const owner = await this.getOwnerProfile(request.createdBy);
    const property = await this.getPropertyDetail(request.propertyId);

    if (!owner || !property) {
      return undefined;
    }

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
      owner,
      property,
    };
  }

  private async getOwnerProfile(
    userId: string,
  ): Promise<RoommateRequestOwnerProfile | undefined> {
    const rows = await this.db
      .select({
        fullName: users.fullName,
        profileUrl: users.image,
        phoneNumber: userSettings.phoneNumber,
      })
      .from(users)
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return undefined;
    }

    return {
      fullName: row.fullName,
      profileUrl: row.profileUrl,
      phoneNumber: row.phoneNumber,
    };
  }

  private async getPropertyDetail(
    propertyId: string,
  ): Promise<RoommateRequestPropertyDetail | undefined> {
    const propertyRows = await this.db
      .select({
        id: properties.id,
        ownerId: properties.ownerId,
        description: properties.description,
        sizeM2: properties.sizeM2,
        roomCount: properties.roomCount,
        country: properties.country,
        city: properties.city,
        zipCode: properties.zipCode,
        street: properties.street,
        streetNumber: properties.streetNumber,
        location: properties.location,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
      })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    const property = propertyRows[0];

    if (!property) {
      return undefined;
    }

    const location = convertDbLocation(property.location);

    const roomRows = await this.db
      .select({
        roomType: propertyRooms.roomType,
        count: propertyRooms.count,
      })
      .from(propertyRooms)
      .where(eq(propertyRooms.propertyId, propertyId))
      .orderBy(desc(propertyRooms.count));

    const equipmentRows = await this.db
      .select({
        equipmentType: equipmentTypes.name,
        count: propertyEquipment.quantity,
      })
      .from(propertyEquipment)
      .innerJoin(
        equipmentTypes,
        eq(propertyEquipment.equipmentTypeId, equipmentTypes.id),
      )
      .where(eq(propertyEquipment.propertyId, propertyId))
      .orderBy(asc(equipmentTypes.name));

    const imageRows = await this.db
      .select({
        id: propertyImages.id,
        propertyId: propertyImages.propertyId,
        imageUrl: propertyImages.imageUrl,
        title: propertyImages.title,
        createdAt: propertyImages.createdAt,
        updatedAt: propertyImages.updatedAt,
      })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(desc(propertyImages.title), asc(propertyImages.createdAt));

    return {
      id: property.id,
      ownerId: property.ownerId,
      description: property.description,
      sizeM2: property.sizeM2,
      roomCount: property.roomCount,
      country: property.country,
      city: property.city,
      zipCode: property.zipCode,
      street: property.street,
      streetNumber: property.streetNumber,
      lat: location?.lat ?? 0,
      lng: location?.lng ?? 0,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      rooms: roomRows,
      equipment: equipmentRows,
      images: imageRows.map(image => ({
        id: image.id,
        propertyId: image.propertyId,
        imageUrl: image.imageUrl ?? '',
        title: image.title,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
      })),
    };
  }

  async getRoommateRequestsPage(
    params: GetRoommateRequestsParams,
  ): Promise<RoommateRequestsPage> {
    const { limit, cursor, lat, lng } = params;
    const hasLocation = lat !== undefined && lng !== undefined;

    const rows = hasLocation
      ? await this.queryByDistance(limit, cursor, lat, lng)
      : await this.queryByRecency(limit, cursor);

    const items = rows.map(row => this.toListItem(row));

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
        rr.title AS "title",
        p.id AS "propertyId",
        p.country AS "country",
        p.city AS "city",
        p.zip_code AS "zipCode",
        p.street AS "street",
        p.street_number AS "streetNumber",
        p.location AS "location",
        ti.id AS "titleImageId",
        NULL::float8 AS "distance"
      FROM roommate_requests rr
      JOIN properties p ON p.id = rr.property_id
      LEFT JOIN property_images ti ON ti.property_id = p.id AND ti.title = true
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
      where = sql`WHERE (sub.distance, sub."rrId") > (${Number(key)}, ${id})`;
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
          rr.title AS "title",
          p.id AS "propertyId",
          p.country AS "country",
          p.city AS "city",
          p.zip_code AS "zipCode",
          p.street AS "street",
          p.street_number AS "streetNumber",
          p.location AS "location",
          ti.id AS "titleImageId",
          ST_Distance(
            p.location,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS distance
        FROM roommate_requests rr
        JOIN properties p ON p.id = rr.property_id
        LEFT JOIN property_images ti ON ti.property_id = p.id AND ti.title = true
      ) sub
      ${where}
      ORDER BY sub.distance ASC, sub."rrId" ASC
      LIMIT ${limit + 1}
    `);

    return result.rows as unknown as RawPageRow[];
  }

  private toListItem(row: RawPageRow): RoommateRequestListItem {
    const location = convertDbLocation(row.location);
    return {
      id: row.rrId,
      title: row.title,
      maxRoommates: row.maxRoommates,
      currentRoommates: row.currentRoommates,
      priceAmount: row.priceAmount,
      priceCurrency: row.priceCurrency as RoommateRequestCurrency,
      property: {
        id: row.propertyId,
        country: row.country,
        city: row.city,
        zipCode: row.zipCode,
        street: row.street,
        streetNumber: row.streetNumber,
        lat: location?.lat ?? 0,
        lng: location?.lng ?? 0,
        titleImageId: row.titleImageId,
      },
    };
  }
}
