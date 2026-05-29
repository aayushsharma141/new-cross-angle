-- =============================================================
-- ADD UNIQUE CONSTRAINT ON media.file_name
-- Required for: supabase.from('media').upsert(..., { onConflict: 'file_name' })
-- Without this constraint, PostgREST falls back to an INSERT and duplicate
-- rows can accumulate whenever a file is re-uploaded with the same name.
-- =============================================================

-- First, deduplicate any existing rows that share the same file_name.
-- Keep the most-recently-created row, delete the older ones.
DELETE FROM public.media
WHERE id NOT IN (
    SELECT DISTINCT ON (file_name) id
    FROM public.media
    ORDER BY file_name, created_at DESC
);

-- Add the unique constraint. IF NOT EXISTS syntax is not supported for
-- constraints, so we use a conditional block via DO $$.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'media_file_name_key'
          AND conrelid = 'public.media'::regclass
    ) THEN
        ALTER TABLE public.media
            ADD CONSTRAINT media_file_name_key UNIQUE (file_name);
    END IF;
END $$;
