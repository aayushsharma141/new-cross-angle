-- Fix missing created_at column in hero_media table if it doesn't exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hero_media') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hero_media' AND column_name='created_at') THEN
            EXECUTE 'ALTER TABLE public.hero_media ADD COLUMN created_at timestamptz DEFAULT now();';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hero_media' AND column_name='updated_at') THEN
            EXECUTE 'ALTER TABLE public.hero_media ADD COLUMN updated_at timestamptz DEFAULT now();';
        END IF;
    END IF;
END $$;
