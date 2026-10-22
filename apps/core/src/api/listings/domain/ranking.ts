export type ListingSortBy =
  | 'PRICE'
  | 'DISTANCE_TRANSIT'
  | 'DISTANCE_CITY_CENTER';

export type RankingCriterion = ListingSortBy | 'LOCATION';

export interface RankingCriterionConfig {
  weight: number;
  referenceMeters?: number;
  referencePower?: number;
}

// Base weight for each user-selected preference. Location (the user's own
// coordinates) is weighted higher so it dominates when provided. The
// referenceMeters value drives the diminishing-returns distance score.
export const RANKING_CRITERION_CONFIG: Record<
  RankingCriterion,
  RankingCriterionConfig
> = {
  PRICE: { weight: 1 },
  DISTANCE_TRANSIT: { weight: 1, referenceMeters: 500 },
  DISTANCE_CITY_CENTER: { weight: 1, referenceMeters: 1000 },
  LOCATION: { weight: 10, referenceMeters: 3000, referencePower: 3 },
};
