CREATE TABLE IF NOT EXISTS public.webhook_failures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_url text NOT NULL,
    payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    attempt_count integer DEFAULT 0,
    last_attempt_at timestamptz,
    next_retry_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    error_message text
);

-- Index for efficient polling
CREATE INDEX IF NOT EXISTS idx_webhook_failures_pending 
ON public.webhook_failures(next_retry_at) 
WHERE status = 'pending';
