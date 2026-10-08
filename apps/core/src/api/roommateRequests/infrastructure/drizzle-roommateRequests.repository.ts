import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, sql, type SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  equipmentTypes,
  properties,
  propertyEquipment,
  propertyImages,
  propertyRooms,
  roommateApplications,
  roommateRequests,
  userSettings,
  users,
} from '@/db/schema/index';
import * as schema from '@/db/schema/index';
import {
  CreateRoommateRequestModel,
  GetRoommateRequestsParams,
  GetUserRoommateRequestsParams,
  RoommateRequest,
  type RoommateRequestCurrency,
  type RoommateRequestStatus,
  RoommateRequestDetail,
  RoommateRequestListItem,
  RoommateRequestOwnerProfile,
  RoommateRequestPropertyDetail,
  RoommateRequestsPage,
  UpdateRoommateRequestModel,
  UpdateRoommateRequestStatusModel,
  UserRoommateRequestDetail,
  UserRoommateRequestListItem,
  UserRoommateRequestsPage,
} from '@/api/roommateRequests/domain/entity/roommateRequest';
import type { RoommateApplicationWithApplicant } from '@/api/roommateApplications/domain/entity/roommateApplication';
import { IRoommateRequestsRepository } from '@/api/roommateRequests/domain/interface/roommateRequests.repository';
import {
  nullable,
  RoommateRequestFilters,
  RoommateRequestGeo,
  RoommateRequestRanking,
} from '@/api/roommateRequests/infrastructure/roommateRequests.query';
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
}

interface RawUserPageRow extends RawPageRow {
  status: string;
  pendingApplicationsCount: number;
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

function encodeOffsetCursor(offset: number): string {
  return Buffer.from(String(offset)).toString('base64url');
}

function decodeOffsetCursor(cursor: string): number {
  const offset = Number(Buffer.from(cursor, 'base64url').toString('utf8'));
  return Number.isNaN(offset) ? 0 : offset;
}

function slicePage<T>(
  items: T[],
  limit: number,
): { items: T[]; hasNext: boolean } {
  const hasNext = items.length > limit;
  return { items: hasNext ? items.slice(0, limit) : items, hasNext };
}

@Injectable()
export class DrizzleRoommateRequestsRepository
  implements IRoommateRequestsRepository
{
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private priceEurExpression(
    amount: number,
    currency: RoommateRequestCurrency,
  ): SQL {
    return sql`${amount} * (
      SELECT eur_rate
      FROM core.exchange_rates
      WHERE currency::text = ${currency}
    )`;
  }

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
        priceEur: this.priceEurExpression(
          request.priceAmount,
          request.priceCurrency,
        ),
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

  async updateRoommateRequest(
    id: string,
    request: UpdateRoommateRequestModel,
  ): Promise<RoommateRequest | undefined> {
    const [updatedRequest] = await this.db
      .update(roommateRequests)
      .set({
        title: request.title,
        description: request.description,
        priceAmount: request.priceAmount,
        priceCurrency: request.priceCurrency,
        priceEur: this.priceEurExpression(
          request.priceAmount,
          request.priceCurrency,
        ),
        idealMoveInDate: request.idealMoveInDate ?? null,
        maxRoommates: request.maxRoommates,
        currentRoommates: request.currentRoommates,
        updatedAt: new Date(),
      })
      .where(eq(roommateRequests.id, id))
      .returning();

    return updatedRequest;
  }

  async updateRoommateRequestStatus(
    id: string,
    updates: UpdateRoommateRequestStatusModel,
  ): Promise<RoommateRequest | undefined> {
    const set: Partial<typeof roommateRequests.$inferInsert> = {
      status: updates.status,
      updatedAt: new Date(),
    };

    if (updates.maxRoommates !== undefined) {
      set.maxRoommates = updates.maxRoommates;
    }
    if (updates.currentRoommates !== undefined) {
      set.currentRoommates = updates.currentRoommates;
    }
    if ('closedAt' in updates) {
      set.closedAt = updates.closedAt;
    }

    const [updatedRequest] = await this.db
      .update(roommateRequests)
      .set(set)
      .where(eq(roommateRequests.id, id))
      .returning();

    return updatedRequest;
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

  async getUserRoommateRequestDetail(
    userId: string,
    roommateRequestId: string,
  ): Promise<UserRoommateRequestDetail | undefined> {
    const request = await this.getRoommateRequestById(roommateRequestId);

    if (!request || request.createdBy !== userId) {
      return undefined;
    }

    const owner = await this.getOwnerProfile(request.createdBy);
    const property = await this.getPropertyDetail(request.propertyId);

    if (!owner || !property) {
      return undefined;
    }

    const applications = await this.getApplicationsWithApplicants(
      roommateRequestId,
    );

    return {
      ...request,
      idealMoveInDate: request.idealMoveInDate ?? null,
      closedAt: request.closedAt ?? null,
      owner,
      property,
      applications,
    };
  }

  private async getApplicationsWithApplicants(
    roommateRequestId: string,
  ): Promise<RoommateApplicationWithApplicant[]> {
    const rows = await this.db
      .select({
        id: roommateApplications.id,
        roommateRequestId: roommateApplications.roommateRequestId,
        applicantId: roommateApplications.applicantId,
        note: roommateApplications.note,
        status: roommateApplications.status,
        createdAt: roommateApplications.createdAt,
        fullName: users.fullName,
        email: users.email,
        profileUrl: users.image,
        phoneNumber: userSettings.phoneNumber,
      })
      .from(roommateApplications)
      .innerJoin(users, eq(users.id, roommateApplications.applicantId))
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .where(eq(roommateApplications.roommateRequestId, roommateRequestId))
      .orderBy(
        desc(roommateApplications.createdAt),
        desc(roommateApplications.id),
      );

    return rows.map(row => ({
      id: row.id,
      roommateRequestId: row.roommateRequestId,
      applicantId: row.applicantId,
      note: row.note,
      status: row.status,
      createdAt: row.createdAt,
      applicant: {
        id: row.applicantId,
        fullName: row.fullName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        profileUrl: row.profileUrl,
      },
    }));
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

  async getRoommateRequests(
    params: GetRoommateRequestsParams,
  ): Promise<RoommateRequestsPage> {
    const { limit, cursor, lat, lng, sortBy } = params;
    const hasLocation = lat !== undefined && lng !== undefined;
    const hasRanking = sortBy !== undefined && sortBy.length > 0;

    const where = RoommateRequestFilters.buildWhere(params);
    const distanceToUser = nullable(
      hasLocation,
      RoommateRequestGeo.distanceToUser(lat, lng),
    );
    const distanceToCenter = nullable(
      hasRanking,
      RoommateRequestGeo.distanceToCityCenter(),
    );
    const distanceToNearestTransit = nullable(
      hasRanking,
      RoommateRequestGeo.distanceToNearestTransit(),
    );
    const minPrice = nullable(hasRanking, RoommateRequestRanking.minPrice());
    const maxPrice = nullable(hasRanking, RoommateRequestRanking.maxPrice());
    const score = nullable(
      hasRanking,
      RoommateRequestRanking.buildScoreExpression(
        RoommateRequestRanking.buildCriteria(sortBy ?? [], hasLocation),
      ),
    );
    const orderBy = RoommateRequestRanking.buildOrderBy(hasRanking, hasLocation);

    const offset = cursor ? decodeOffsetCursor(cursor) : 0;

    const result = await this.db.execute(sql`
      SELECT *
      FROM (
        SELECT metrics.*, ${score} AS "score"
        FROM (
          SELECT
            rr.id AS "rrId",
            rr.max_roommates AS "maxRoommates",
            rr.current_roommates AS "currentRoommates",
            rr.price_amount AS "priceAmount",
            rr.price_currency AS "priceCurrency",
            rr.price_eur AS "priceEur",
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
            ${distanceToUser} AS "distanceToUser",
            ${distanceToCenter} AS "distanceToCenter",
            ${distanceToNearestTransit} AS "distanceToNearestTransit",
            ${minPrice} AS "minPrice",
            ${maxPrice} AS "maxPrice"
          FROM core.roommate_requests rr
          JOIN core.properties p ON p.id = rr.property_id
          LEFT JOIN core.property_images ti ON ti.property_id = p.id AND ti.title = true
          ${where}
        ) metrics
      ) ranked
      ${orderBy}
      LIMIT ${limit + 1}
      OFFSET ${offset}
    `);

    const rows = result.rows as unknown as RawPageRow[];
    const { items, hasNext } = slicePage(
      rows.map(row => this.toListItem(row)),
      limit,
    );

    return {
      items,
      nextCursor: hasNext ? encodeOffsetCursor(offset + limit) : null,
    };
  }

  async getRoommateRequestsPageByOwner(
    ownerId: string,
    params: GetUserRoommateRequestsParams,
  ): Promise<UserRoommateRequestsPage> {
    const { limit, cursor, status } = params;

    const conditions = [sql`rr.created_by = ${ownerId}`];
    if (cursor) {
      const { key, id } = decodeCursor(cursor);
      conditions.push(sql`(rr.created_at, rr.id) < (${key}, ${id})`);
    }
    if (status) {
      conditions.push(sql`rr.status = ${status}`);
    }
    const where = sql`WHERE ${sql.join(conditions, sql` AND `)}`;

    const result = await this.db.execute(sql`
      SELECT
        rr.id AS "rrId",
        rr.max_roommates AS "maxRoommates",
        rr.current_roommates AS "currentRoommates",
        rr.price_amount AS "priceAmount",
        rr.price_currency AS "priceCurrency",
        rr.created_at AS "createdAt",
        rr.title AS "title",
        rr.status AS "status",
        p.id AS "propertyId",
        p.country AS "country",
        p.city AS "city",
        p.zip_code AS "zipCode",
        p.street AS "street",
        p.street_number AS "streetNumber",
        p.location AS "location",
        ti.id AS "titleImageId",
        (
          SELECT COUNT(*)::int
          FROM core.roommate_applications ra
          WHERE ra.roommate_request_id = rr.id AND ra.status = 'PENDING'
        ) AS "pendingApplicationsCount"
      FROM core.roommate_requests rr
      JOIN core.properties p ON p.id = rr.property_id
      LEFT JOIN core.property_images ti ON ti.property_id = p.id AND ti.title = true
      ${where}
      ORDER BY rr.created_at DESC, rr.id DESC
      LIMIT ${limit + 1}
    `);

    const rows = result.rows as unknown as RawUserPageRow[];

    const { items, hasNext } = slicePage(
      rows.map(row => this.toUserListItem(row)),
      limit,
    );
    const lastRow = hasNext ? rows[limit - 1] : undefined;
    const nextCursor =
      hasNext && lastRow ? encodeCursor(lastRow.createdAt, lastRow.rrId) : null;

    return { items, nextCursor };
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

  private toUserListItem(row: RawUserPageRow): UserRoommateRequestListItem {
    return {
      ...this.toListItem(row),
      status: row.status as RoommateRequestStatus,
      pendingApplicationsCount: row.pendingApplicationsCount,
    };
  }
}
