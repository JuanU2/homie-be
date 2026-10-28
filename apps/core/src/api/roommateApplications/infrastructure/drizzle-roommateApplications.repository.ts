import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  roommateApplications,
  listings,
  properties,
  userSettings,
  users,
} from '@/db/schema/index';
import * as schema from '@/db/schema/index';
import {
  CreateRoommateApplicationModel,
  GetRoommateApplicationsParams,
  RoommateApplication,
  RoommateApplicationListItem,
  RoommateApplicationListItemWithApplicant,
  RoommateApplicationWithApplicant,
  RoommateApplicationsPage,
  RoommateApplicationsWithApplicantPage,
  type RoommateApplicationStatus,
} from '@/api/roommateApplications/domain/entity/roommateApplication';
import { IRoommateApplicationsRepository } from '@/api/roommateApplications/domain/interface/roommateApplications.repository';

interface RawApplicationPageRow {
  id: string;
  status: string;
  note: string | null;
  viewingOptions: unknown[] | null;
  viewingChosenAt: string | null;
  createdAt: string;
  listingId: string;
  propertyId: string;
  title: string;
  titleImageId: string | null;
  country: string;
  city: string;
  street: string;
  streetNumber: string;
}

interface RawApplicationWithApplicantPageRow {
  id: string;
  status: string;
  note: string | null;
  viewingOptions: unknown[] | null;
  viewingChosenAt: string | null;
  createdAt: string;
  listingId: string;
  propertyId: string;
  title: string;
  titleImageId: string | null;
  country: string;
  city: string;
  street: string;
  streetNumber: string;
  applicantId: string;
  fullName: string;
  email: string;
  profileUrl: string | null;
  phoneNumber: string | null;
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
export class DrizzleRoommateApplicationsRepository
  implements IRoommateApplicationsRepository
{
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createRoommateApplication(
    model: CreateRoommateApplicationModel,
  ): Promise<RoommateApplication> {
    const [created] = await this.db
      .insert(roommateApplications)
      .values({
        listingId: model.listingId,
        applicantId: model.applicantId,
        note: model.note ?? null,
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create roommate application');
    }

    return created;
  }

  async getRoommateApplicationById(
    id: string,
  ): Promise<RoommateApplication | undefined> {
    return this.db.query.roommateApplications.findFirst({
      where: eq(roommateApplications.id, id),
    });
  }

  async getLatestActiveApplication(
    applicantId: string,
    listingId: string,
  ): Promise<RoommateApplication | undefined> {
    return this.db.query.roommateApplications.findFirst({
      where: and(
        eq(roommateApplications.applicantId, applicantId),
        eq(roommateApplications.listingId, listingId),
        inArray(roommateApplications.status, [
          'PENDING',
          'VIEWING_OFFERED',
          'VIEWING_CONFIRMED',
          'VIEWING_DECLINED',
          'ACCEPTED',
        ] as const),
      ),
      orderBy: desc(roommateApplications.updatedAt),
    });
  }

  async updateRoommateApplicationStatus(
    id: string,
    status: RoommateApplicationStatus,
  ): Promise<RoommateApplication | undefined> {
    const [updated] = await this.db
      .update(roommateApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(roommateApplications.id, id))
      .returning();

    return updated;
  }

  async updateViewingState(
    id: string,
    data: {
      status: RoommateApplicationStatus;
      viewingOptions: Date[] | null;
      viewingChosenAt: Date | null;
    },
  ): Promise<RoommateApplication | undefined> {
    const [updated] = await this.db
      .update(roommateApplications)
      .set({
        status: data.status,
        viewingOptions: data.viewingOptions,
        viewingChosenAt: data.viewingChosenAt,
        updatedAt: new Date(),
      })
      .where(eq(roommateApplications.id, id))
      .returning();

    return updated;
  }

  async acceptRoommateApplication(
    id: string,
    listingId: string,
  ): Promise<RoommateApplication | undefined> {
    return this.db.transaction(async tx => {
      const [updated] = await tx
        .update(roommateApplications)
        .set({ status: 'ACCEPTED', updatedAt: new Date() })
        .where(eq(roommateApplications.id, id))
        .returning();

      if (!updated) {
        return undefined;
      }

      const [request] = await tx
        .update(listings)
        .set({
          currentRoommates: sql`${listings.currentRoommates} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(listings.id, listingId),
            sql`${listings.currentRoommates} < ${listings.maxRoommates}`,
          ),
        )
        .returning({
          currentRoommates: listings.currentRoommates,
          maxRoommates: listings.maxRoommates,
        });

      if (request && request.currentRoommates === request.maxRoommates) {
        await tx
          .update(listings)
          .set({ status: 'CLOSED', closedAt: new Date(), updatedAt: new Date() })
          .where(eq(listings.id, listingId));
      }

      return updated;
    });
  }

  async getRoommateApplicationsPage(
    applicantId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsPage> {
    const { limit, cursor, status } = params;

    const conditions = [sql`ra.applicant_id = ${applicantId}`];
    if (cursor) {
      const { key, id } = decodeCursor(cursor);
      conditions.push(sql`(ra.created_at, ra.id) < (${key}, ${id})`);
    }
    if (status === 'PENDING') {
      conditions.push(sql`ra.status IN ('PENDING', 'VIEWING_OFFERED', 'VIEWING_CONFIRMED', 'VIEWING_DECLINED')`);
    } else if (status) {
      conditions.push(sql`ra.status = ${status}`);
    }
    const where = sql`WHERE ${sql.join(conditions, sql` AND `)}`;

    const result = await this.db.execute(sql`
      SELECT
        ra.id AS "id",
        ra.status AS "status",
        ra.note AS "note",
        to_json(ra.viewing_options) AS "viewingOptions",
        ra.viewing_chosen_at AS "viewingChosenAt",
        ra.created_at AS "createdAt",
        ra.listing_id AS "listingId",
        rr.property_id AS "propertyId",
        rr.title AS "title",
        ti.id AS "titleImageId",
        p.country AS "country",
        p.city AS "city",
        p.street AS "street",
        p.street_number AS "streetNumber"
      FROM core.roommate_applications ra
      JOIN core.listings rr ON rr.id = ra.listing_id
      JOIN core.properties p ON p.id = rr.property_id
      LEFT JOIN core.property_images ti ON ti.property_id = rr.property_id AND ti.title = true
      ${where}
      ORDER BY ra.created_at DESC, ra.id DESC
      LIMIT ${limit + 1}
    `);

    const rows = result.rows as unknown as RawApplicationPageRow[];

    const items = rows.map(row => this.toListItem(row));

    const hasNext = rows.length > limit;
    const pageItems = hasNext ? items.slice(0, limit) : items;
    const lastRow = hasNext ? rows[limit - 1] : undefined;
    const nextCursor =
      hasNext && lastRow ? encodeCursor(lastRow.createdAt, lastRow.id) : null;

    return { items: pageItems, nextCursor };
  }

  private toListItem(row: RawApplicationPageRow): RoommateApplicationListItem {
    return {
      id: row.id,
      listingId: row.listingId,
      propertyId: row.propertyId,
      status: row.status as RoommateApplicationStatus,
      note: row.note,
      viewingOptions: this.toDates(row.viewingOptions),
      viewingChosenAt: row.viewingChosenAt
        ? new Date(row.viewingChosenAt)
        : null,
      createdAt: new Date(row.createdAt),
      title: row.title,
      titleImageId: row.titleImageId,
      country: row.country,
      city: row.city,
      street: row.street,
      streetNumber: row.streetNumber,
    };
  }

  private toDates(values: unknown): Date[] | null {
    if (values == null) return null;
    const list = Array.isArray(values)
      ? values
      : (JSON.parse(values as string) as unknown[]);
    return list.map(value => new Date(value as string));
  }

  async getRoommateApplicationsPageForOwner(
    ownerId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsWithApplicantPage> {
    const { limit, cursor, status } = params;

    const conditions = [sql`rr.created_by = ${ownerId}`];
    if (cursor) {
      const { key, id } = decodeCursor(cursor);
      conditions.push(sql`(ra.created_at, ra.id) < (${key}, ${id})`);
    }
    if (status === 'PENDING') {
      conditions.push(sql`ra.status IN ('PENDING', 'VIEWING_OFFERED', 'VIEWING_CONFIRMED', 'VIEWING_DECLINED')`);
    } else if (status) {
      conditions.push(sql`ra.status = ${status}`);
    }
    const where = sql`WHERE ${sql.join(conditions, sql` AND `)}`;

    const result = await this.db.execute(sql`
      SELECT
        ra.id AS "id",
        ra.status AS "status",
        ra.note AS "note",
        to_json(ra.viewing_options) AS "viewingOptions",
        ra.viewing_chosen_at AS "viewingChosenAt",
        ra.created_at AS "createdAt",
        ra.listing_id AS "listingId",
        rr.property_id AS "propertyId",
        rr.title AS "title",
        ti.id AS "titleImageId",
        p.country AS "country",
        p.city AS "city",
        p.street AS "street",
        p.street_number AS "streetNumber",
        u.id AS "applicantId",
        u.full_name AS "fullName",
        u.email AS "email",
        u.image AS "profileUrl",
        us.phone_number AS "phoneNumber"
      FROM core.roommate_applications ra
      JOIN core.listings rr ON rr.id = ra.listing_id
      JOIN core.properties p ON p.id = rr.property_id
      LEFT JOIN core.property_images ti ON ti.property_id = rr.property_id AND ti.title = true
      JOIN core.users u ON u.id = ra.applicant_id
      LEFT JOIN core.user_settings us ON us.user_id = u.id
      ${where}
      ORDER BY ra.created_at DESC, ra.id DESC
      LIMIT ${limit + 1}
    `);

    const rows = result.rows as unknown as RawApplicationWithApplicantPageRow[];

    const items = rows.map(row => this.toListItemWithApplicant(row));

    const hasNext = rows.length > limit;
    const pageItems = hasNext ? items.slice(0, limit) : items;
    const lastRow = hasNext ? rows[limit - 1] : undefined;
    const nextCursor =
      hasNext && lastRow ? encodeCursor(lastRow.createdAt, lastRow.id) : null;

    return { items: pageItems, nextCursor };
  }

  private toListItemWithApplicant(
    row: RawApplicationWithApplicantPageRow,
  ): RoommateApplicationListItemWithApplicant {
    return {
      id: row.id,
      listingId: row.listingId,
      propertyId: row.propertyId,
      status: row.status as RoommateApplicationStatus,
      note: row.note,
      viewingOptions: this.toDates(row.viewingOptions),
      viewingChosenAt: row.viewingChosenAt
        ? new Date(row.viewingChosenAt)
        : null,
      createdAt: new Date(row.createdAt),
      title: row.title,
      titleImageId: row.titleImageId,
      country: row.country,
      city: row.city,
      street: row.street,
      streetNumber: row.streetNumber,
      applicant: {
        id: row.applicantId,
        fullName: row.fullName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        profileUrl: row.profileUrl,
      },
    };
  }

  async countRoommateApplicationsForOwner(
    ownerId: string,
    status?: RoommateApplicationStatus,
  ): Promise<number> {
    const conditions = [sql`rr.created_by = ${ownerId}`];
    if (status === 'PENDING') {
      conditions.push(sql`ra.status IN ('PENDING', 'VIEWING_OFFERED', 'VIEWING_CONFIRMED', 'VIEWING_DECLINED')`);
    } else if (status) {
      conditions.push(sql`ra.status = ${status}`);
    }
    const where = sql`WHERE ${sql.join(conditions, sql` AND `)}`;

    const result = await this.db.execute(sql`
      SELECT COUNT(*)::int AS "count"
      FROM core.roommate_applications ra
      JOIN core.listings rr ON rr.id = ra.listing_id
      ${where}
    `);

    const row = result.rows[0] as { count: number } | undefined;
    return row?.count ?? 0;
  }

  async getRoommateApplicationsForRequest(
    listingId: string,
  ): Promise<RoommateApplicationWithApplicant[]> {
    const rows = await this.db
      .select({
        id: roommateApplications.id,
        listingId: roommateApplications.listingId,
        applicantId: roommateApplications.applicantId,
        note: roommateApplications.note,
        status: roommateApplications.status,
        viewingOptions: roommateApplications.viewingOptions,
        viewingChosenAt: roommateApplications.viewingChosenAt,
        createdAt: roommateApplications.createdAt,
        country: properties.country,
        city: properties.city,
        street: properties.street,
        streetNumber: properties.streetNumber,
        fullName: users.fullName,
        email: users.email,
        profileUrl: users.image,
        phoneNumber: userSettings.phoneNumber,
      })
      .from(roommateApplications)
      .innerJoin(users, eq(users.id, roommateApplications.applicantId))
      .innerJoin(listings, eq(listings.id, roommateApplications.listingId))
      .innerJoin(properties, eq(properties.id, listings.propertyId))
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .where(eq(roommateApplications.listingId, listingId))
      .orderBy(
        desc(roommateApplications.createdAt),
        desc(roommateApplications.id),
      );

    return rows.map(row => ({
      id: row.id,
      listingId: row.listingId,
      applicantId: row.applicantId,
      note: row.note,
      status: row.status,
      viewingOptions: row.viewingOptions,
      viewingChosenAt: row.viewingChosenAt,
      createdAt: row.createdAt,
      country: row.country,
      city: row.city,
      street: row.street,
      streetNumber: row.streetNumber,
      applicant: {
        id: row.applicantId,
        fullName: row.fullName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        profileUrl: row.profileUrl,
      },
    }));
  }
}
