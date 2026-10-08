import { char, numeric, timestamp } from 'drizzle-orm/pg-core';
import { core } from './core';

export const exchangeRates = core.table('exchange_rates', {
  currency: char('currency', { length: 3 }).primaryKey(),
  eurRate: numeric('eur_rate', { precision: 18, scale: 8 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
