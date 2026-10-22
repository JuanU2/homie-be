import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  Favourite,
  FavouritesPage,
  GetFavouritesParams,
} from '@/api/favourites/domain/entity/favourite';
import type { IFavouritesRepository } from '@/api/favourites/domain/interface/favourites.repository';
import type {
  ListingCurrency,
  ListingListItem,
} from '@/api/listings/domain/entity/listing';
import { favourites } from '@/db/schema/index';
import * as schema from '@/db/schema/index';
import { convertDbLocation } from '@/utils/locationUtil';

interface RawFavouritePageRow {
  favouriteCreatedAt: string;
  favouriteId: string;
  rrId: string;
  maxRoommates: number;
  currentRoommates: number;
  priceAmount: number;
  priceCurrency: string;
  title: string;
  propertyId: string;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  location: string;
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

function slicePage<T>(
  items: T[],
  limit: number,
): { items: T[]; hasNext: boolean } {
  const hasNext = items.length > limit;
  return { items: hasNext ? items.slice(0, limit) : items, hasNext };
}

@Injectable()
export class DrizzleFavouritesRepository implements IFavouritesRepository {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(userId: string, listingId: string): Promise<Favourite> {
    const [created] = await this.db
      .insert(favourites)
      .values({ userId, listingId })
      .onConflictDoNothing()
      .returning();

    if (created) {
      return created;
    }

    const existing = await this.db.query.favourites.findFirst({
      where: and(
        eq(favourites.userId, userId),
        eq(favourites.listingId, listingId),
      ),
    });

    if (!existing) {
      throw new Error('Failed to create favourite');
    }

    return existing;
  }

  async delete(userId: string, listingId: string): Promise<void> {
    await this.db
      .delete(favourites)
      .where(
        and(
          eq(favourites.userId, userId),
          eq(favourites.listingId, listingId),
        ),
      );
  }

  async exists(userId: string, listingId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: favourites.id })
      .from(favourites)
      .where(
        and(
          eq(favourites.userId, userId),
          eq(favourites.listingId, listingId),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  async getFavouritesPage(
    userId: string,
    params: GetFavouritesParams,
  ): Promise<FavouritesPage> {
    const { limit, cursor } = params;

    const conditions = [sql`f.user_id = ${userId}`];
    if (cursor) {
      const { key, id } = decodeCursor(cursor);
      conditions.push(sql`(f.created_at, f.id) < (${key}, ${id})`);
    }
    const where = sql`WHERE ${sql.join(conditions, sql` AND `)}`;

    const result = await this.db.execute(sql`
      SELECT
        f.created_at AS "favouriteCreatedAt",
        f.id AS "favouriteId",
        rr.id AS "rrId",
        rr.max_roommates AS "maxRoommates",
        rr.current_roommates AS "currentRoommates",
        rr.price_amount AS "priceAmount",
        rr.price_currency AS "priceCurrency",
        rr.title AS "title",
        p.id AS "propertyId",
        p.country AS "country",
        p.city AS "city",
        p.zip_code AS "zipCode",
        p.street AS "street",
        p.street_number AS "streetNumber",
        p.location AS "location",
        ti.id AS "titleImageId"
      FROM core.favourites f
      JOIN core.listings rr ON rr.id = f.listing_id
      JOIN core.properties p ON p.id = rr.property_id
      LEFT JOIN core.property_images ti ON ti.property_id = p.id AND ti.title = true
      ${where}
      ORDER BY f.created_at DESC, f.id DESC
      LIMIT ${limit + 1}
    `);

    const rows = result.rows as unknown as RawFavouritePageRow[];
    const { items, hasNext } = slicePage(
      rows.map(row => this.toListItem(row)),
      limit,
    );
    const lastRow = hasNext ? rows[limit - 1] : undefined;
    const nextCursor =
      hasNext && lastRow
        ? encodeCursor(lastRow.favouriteCreatedAt, lastRow.favouriteId)
        : null;

    return { items, nextCursor };
  }

  private toListItem(row: RawFavouritePageRow): ListingListItem {
    const location = convertDbLocation(row.location);
    return {
      id: row.rrId,
      title: row.title,
      maxRoommates: row.maxRoommates,
      currentRoommates: row.currentRoommates,
      priceAmount: row.priceAmount,
      priceCurrency: row.priceCurrency as ListingCurrency,
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
