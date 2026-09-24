import { config } from 'dotenv';
import { Pool } from 'pg';
import { createDb } from '@homie/db';
import * as schema from './schema';

config({ path: '../../.env' });

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

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = createDb(pool, schema);

  await db
    .insert(schema.equipmentTypes)
    .values(EQUIPMENT_TYPES.map((name) => ({ name })))
    .onConflictDoNothing({ target: schema.equipmentTypes.name });

  await pool.end();
  console.log('Seeded core equipment types');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
