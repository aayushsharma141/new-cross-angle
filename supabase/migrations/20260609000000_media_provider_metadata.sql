-- =============================================================
-- MEDIA PROVIDER METADATA
-- Adds explicit provider identity so the media table is the single
-- source of truth for Supabase legacy files and ImageKit assets.
-- =============================================================

ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS provider_file_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_path TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'media_storage_provider_check'
      AND conrelid = 'public.media'::regclass
  ) THEN
    ALTER TABLE public.media
      ADD CONSTRAINT media_storage_provider_check
      CHECK (storage_provider IN ('supabase', 'imagekit', 'external'));
  END IF;
END $$;

WITH normalized AS (
  SELECT
    id,
    CASE
      WHEN file_name LIKE 'imagekit:/%' THEN 'imagekit:' || regexp_replace(file_name, '^imagekit:/+', '')
      ELSE file_name
    END AS normalized_file_name,
    created_at
  FROM public.media
),
ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY normalized_file_name
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS row_rank
  FROM normalized
)
DELETE FROM public.media
WHERE id IN (
  SELECT id
  FROM ranked
  WHERE row_rank > 1
);

UPDATE public.media
SET file_name = 'imagekit:' || regexp_replace(file_name, '^imagekit:/+', '')
WHERE file_name LIKE 'imagekit:/%';

UPDATE public.media
SET
  storage_provider = CASE
    WHEN file_name LIKE 'imagekit:%' OR url ILIKE '%ik.imagekit.io%' THEN 'imagekit'
    WHEN url ILIKE '%/storage/v1/object/%' THEN 'supabase'
    ELSE 'external'
  END,
  provider_path = CASE
    WHEN file_name LIKE 'imagekit:%' THEN regexp_replace(file_name, '^imagekit:/?', '')
    ELSE file_name
  END
WHERE provider_path IS NULL;

CREATE INDEX IF NOT EXISTS idx_media_storage_provider
  ON public.media (storage_provider);

CREATE INDEX IF NOT EXISTS idx_media_provider_file_id
  ON public.media (provider_file_id)
  WHERE provider_file_id IS NOT NULL;
