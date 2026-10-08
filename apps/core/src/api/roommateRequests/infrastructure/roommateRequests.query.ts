import { sql, type SQL } from 'drizzle-orm';
import type { GetRoommateRequestsParams } from '@/api/roommateRequests/domain/entity/roommateRequest';
import {
  RANKING_CRITERION_CONFIG,
  type RankingCriterion,
  type RankingCriterionConfig,
} from '@/api/roommateRequests/domain/ranking';

/** Returns `expression` when `active` is true, otherwise `NULL::float8`. */
export function nullable(active: boolean, expression: SQL): SQL {
  return active ? expression : sql`NULL::float8`;
}

export class RoommateRequestFilters {
  static buildWhere(params: GetRoommateRequestsParams): SQL {
    const conditions: SQL[] = [
      sql`rr.status = 'ACTIVE'`,
      ...this.buildConditions(params),
    ];
    return sql`WHERE ${sql.join(conditions, sql` AND `)}`;
  }

  private static buildConditions(params: GetRoommateRequestsParams): SQL[] {
    const conditions: SQL[] = [];
    const { priceFrom, priceTo, equipment, rooms } = params;

    if (priceFrom !== undefined) {
      conditions.push(sql`rr.price_eur >= ${priceFrom}`);
    }
    if (priceTo !== undefined) {
      conditions.push(sql`rr.price_eur <= ${priceTo}`);
    }
    if (equipment?.length) {
      conditions.push(this.matchAllEquipment(equipment));
    }
    if (rooms?.length) {
      conditions.push(this.matchAllRooms(rooms));
    }

    return conditions;
  }

  private static matchAllEquipment(equipment: string[]): SQL {
    const names = equipment.map(name => sql`${name}`);
    return sql`(
      SELECT COUNT(DISTINCT et.name)
      FROM core.property_equipment pe
      JOIN core.equipment_types et ON et.id = pe.equipment_type_id
      WHERE pe.property_id = p.id
        AND et.name IN (${sql.join(names, sql`, `)})
    ) = ${equipment.length}`;
  }

  private static matchAllRooms(rooms: string[]): SQL {
    const roomTypes = rooms.map(roomType => sql`${roomType}`);
    return sql`(
      SELECT COUNT(DISTINCT pr.room_type)
      FROM core.property_rooms pr
      WHERE pr.property_id = p.id
        AND pr.count > 0
        AND pr.room_type::text IN (${sql.join(roomTypes, sql`, `)})
    ) = ${rooms.length}`;
  }
}

export class RoommateRequestGeo {
  static distanceToUser(lat: number | undefined, lng: number | undefined): SQL {
    return this.distanceFromPropertyTo(sql`${lng}`, sql`${lat}`);
  }

  static distanceToCityCenter(): SQL {
    return sql`(
      SELECT ${this.distanceFromPropertyTo(sql`poi.lng`, sql`poi.lat`)}
      FROM core.points_of_interest poi
      WHERE poi.property_id = p.id
        AND poi.location_type::text = 'CITY_CENTER'
      LIMIT 1
    )`;
  }

  static distanceToNearestTransit(): SQL {
    return sql`(
      SELECT MIN(${this.distanceFromPropertyTo(sql`poi.lng`, sql`poi.lat`)})
      FROM core.points_of_interest poi
      WHERE poi.property_id = p.id
        AND poi.location_type::text = 'PUBLIC_TRANSPORT'
    )`;
  }

  private static distanceFromPropertyTo(lng: SQL, lat: SQL): SQL {
    return sql`ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    )`;
  }
}

export class RoommateRequestRanking {
  static minPrice(): SQL {
    return sql`MIN(rr.price_eur) OVER ()`;
  }

  static maxPrice(): SQL {
    return sql`MAX(rr.price_eur) OVER ()`;
  }

  static buildScoreExpression(criteria: RankingCriterion[]): SQL {
    const parts: SQL[] = [];
    let totalWeight = 0;

    for (const criterion of criteria) {
      const config = RANKING_CRITERION_CONFIG[criterion];
      totalWeight += config.weight;
      parts.push(
        sql`${config.weight} * ${this.criterionScoreSql(criterion, config)}`,
      );
    }

    return sql`(${sql.join(parts, sql` + `)}) / ${totalWeight}::float8`;
  }

  static buildCriteria(
    sortBy: RankingCriterion[],
    hasLocation: boolean,
  ): RankingCriterion[] {
    if (!hasLocation || sortBy.includes('LOCATION')) {
      return sortBy;
    }
    return [...sortBy, 'LOCATION'];
  }

  static buildOrderBy(hasRanking: boolean, hasLocation: boolean): SQL {
    if (hasRanking) {
      return sql`ORDER BY "score" DESC, "rrId" ASC`;
    }
    if (hasLocation) {
      return sql`ORDER BY "distanceToUser" ASC, "rrId" ASC`;
    }
    return sql`ORDER BY "createdAt" DESC, "rrId" DESC`;
  }

  private static criterionScoreSql(
    criterion: RankingCriterion,
    config: RankingCriterionConfig,
  ): SQL {
    switch (criterion) {
      case 'PRICE':
        return sql`CASE
          WHEN "minPrice" = "maxPrice" THEN 0.5
          ELSE 1 - ("priceEur" - "minPrice")::float8 / ("maxPrice" - "minPrice")::float8
        END`;
      case 'DISTANCE_CITY_CENTER':
        return sql`COALESCE(1 / (1 + "distanceToCenter" / ${config.referenceMeters}::float8), 0)`;
      case 'DISTANCE_TRANSIT':
        return sql`COALESCE(1 / (1 + "distanceToNearestTransit" / ${config.referenceMeters}::float8), 0)`;
      case 'LOCATION':
        return sql`COALESCE(1 / (1 + "distanceToUser" / ${config.referenceMeters}::float8), 0)`;
    }
  }
}
