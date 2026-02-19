-- Robust migration to add 'viewer' role
DO $$
BEGIN
    -- Create the type if it doesn't exist (handling case where initial migration failed/skipped)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
    ELSE
        -- If it exists, we just ensure 'viewer' is added below
        NULL;
    END IF;
END
$$;

-- Add 'viewer' to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';
