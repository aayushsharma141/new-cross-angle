-- RPC function to compute total media storage on the server side
-- Avoids fetching all rows to the client just to sum size_bytes

CREATE OR REPLACE FUNCTION public.get_total_media_bytes()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(size_bytes), 0)::bigint FROM public.media;
$$;

-- Grant execute to authenticated users (dashboard is behind auth)
GRANT EXECUTE ON FUNCTION public.get_total_media_bytes() TO authenticated;
