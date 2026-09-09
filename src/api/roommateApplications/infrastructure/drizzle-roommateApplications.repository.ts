import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { roommateApplications } from '@/db/schema';
import * as schema from '@/db/schema';
import {
  CreateRoommateApplicationModel,
  GetRoommateApplicationsParams,
  RoommateApplication,
  RoommateApplicationListItem,
  RoommateApplicationsPage,
  type RoommateApplicationStatus,
} from '@/api/roommateApplications/domain/entity/roommateApplication';
import { IRoommateApplicationsRepository } from '@/api/roommateApplications/domain/interface/roommateApplications.repository';

interface RawApplicationPageRow {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  roommateRequestId: string;
  propertyId: string;
  title: string;
  titleImageId: string | null;
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
        roommateRequestId: model.roommateRequestId,
        applicantId: model.applicantId,
        note: model.note ?? null,
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create roommate application');
    }

    return created;
  }

  async getRoommateApplicationsPage(
    ownerId: string,
    params: GetRoommateApplicationsParams,
  ): Promise<RoommateApplicationsPage> {
    const { limit, cursor, status } = params;

    const conditions = [sql`rr.created_by = ${ownerId}`];
    if (cursor) {
      const { key, id } = decodeCursor(cursor);
      conditions.push(sql`(ra.created_at, ra.id) < (${key}, ${id})`);
    }
    if (status) {
      conditions.push(sql`ra.status = ${status}`);
    }
    const where = sql`WHERE ${sql.join(conditions, sql` AND `)}`;

    const result = await this.db.execute(sql`
      SELECT
        ra.id AS "id",
        ra.status AS "status",
        ra.note AS "note",
        ra.created_at AS "createdAt",
        ra.roommate_request_id AS "roommateRequestId",
        rr.property_id AS "propertyId",
        rr.title AS "title",
        ti.id AS "titleImageId"
      FROM roommate_applications ra
      JOIN roommate_requests rr ON rr.id = ra.roommate_request_id
      LEFT JOIN property_images ti ON ti.property_id = rr.property_id AND ti.title = true
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
      roommateRequestId: row.roommateRequestId,
      propertyId: row.propertyId,
      status: row.status as RoommateApplicationStatus,
      note: row.note,
      createdAt: new Date(row.createdAt),
      title: row.title,
      titleImageId: row.titleImageId,
    };
  }
}
