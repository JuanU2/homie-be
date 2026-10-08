import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { createDb } from '@homie/db';
import * as schema from './schema';

config({ path: '.env' });

const EQUIPMENT_TYPES = [
  'fridge',
  'oven',
  'wifi',
  'tv',
  'sofa',
  'bed',
  'microwave',
  'dishwasher',
  'washing-machine',
  'dryer',
  'shower',
  'parking',
  'bike-storage',
  'gym',
  'pet-friendly',
  'garden',
];

// Rates are relative to EUR (1 unit of `currency` = `eurRate` EUR).
const EXCHANGE_RATES = [
  { currency: 'EUR', eurRate: '1.00000000' },
  { currency: 'CZK', eurRate: '0.03900000' },
  { currency: 'USD', eurRate: '0.92000000' },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = createDb(pool, schema);

  await db
    .insert(schema.equipmentTypes)
    .values(EQUIPMENT_TYPES.map((name) => ({ name })))
    .onConflictDoNothing({ target: schema.equipmentTypes.name });

  await db
    .insert(schema.exchangeRates)
    .values(EXCHANGE_RATES)
    .onConflictDoNothing({ target: schema.exchangeRates.currency });

  // Backfill the normalized EUR price for any rows created before price_eur
  // was introduced.
  await db.execute(sql`
    UPDATE core.roommate_requests rr
    SET price_eur = rr.price_amount * er.eur_rate
    FROM core.exchange_rates er
    WHERE er.currency::text = rr.price_currency::text
      AND rr.price_eur IS NULL
  `);

  await pool.end();
  console.log('Seeded core equipment types and exchange rates');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
