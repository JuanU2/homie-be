INSERT INTO "equipment_types" ("name") VALUES
  ('fridge'),
  ('oven'),
  ('wifi'),
  ('tv'),
  ('sofa'),
  ('bed'),
  ('microwave'),
  ('dishwasher'),
  ('washing-machine'),
  ('dryer'),
  ('shower'),
  ('parking'),
  ('bike-storage'),
  ('gym'),
  ('pet-friendly'),
  ('garden')
ON CONFLICT ("name") DO NOTHING;
