DO $$ BEGIN
    CREATE TYPE public.lead_status AS ENUM (
      'new',
      'contacted',
      'qualified',
      'proposal',
      'negotiation',
      'closed',
      'lost'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop default first to avoid casting issues
ALTER TABLE public.leads ALTER COLUMN status DROP DEFAULT;

-- Update existing status values to match enum
UPDATE public.leads
SET status = lower(status);

-- If any status is invalid, set to 'new'
UPDATE public.leads
SET status = 'new'
WHERE status NOT IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost');

-- Now safe to cast
ALTER TABLE public.leads 
ALTER COLUMN status TYPE public.lead_status 
USING status::public.lead_status;

-- Set default
ALTER TABLE public.leads 
ALTER COLUMN status SET DEFAULT 'new'::public.lead_status;
