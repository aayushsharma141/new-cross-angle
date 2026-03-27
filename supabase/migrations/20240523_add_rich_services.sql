-- Migration to add rich content fields to 'services' table

-- 1. Add new columns
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS hero_image text,
ADD COLUMN IF NOT EXISTS category_id text, -- foreign key relationship if 'service_categories' exists, otherwise just text
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS process_steps jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb;

-- 2. Create service_categories table if it doesn't exist (optional, but good for referential integrity)
CREATE TABLE IF NOT EXISTS service_categories (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  hero_image text,
  icon text
);

-- 3. Update existing services with slugs (example logic, adjust as needed)
-- UPDATE services SET slug = lower(replace(title, ' ', '-'));
