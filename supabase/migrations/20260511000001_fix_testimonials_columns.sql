-- Fix missing created_at column in testimonials table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='created_at') THEN
        ALTER TABLE public.testimonials ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='updated_at') THEN
        ALTER TABLE public.testimonials ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;
