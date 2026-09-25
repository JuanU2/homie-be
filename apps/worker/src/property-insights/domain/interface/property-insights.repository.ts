import type { PropertyInsights } from '../../dtos/property-insights.dto';

export interface IPropertyInsightsRepository {
  upsert(propertyId: string, insight: PropertyInsights): Promise<void>;
  get(propertyId: string): Promise<PropertyInsights | null>;
}

export const PROPERTY_INSIGHTS_REPOSITORY = Symbol(
  'PROPERTY_INSIGHTS_REPOSITORY',
);
