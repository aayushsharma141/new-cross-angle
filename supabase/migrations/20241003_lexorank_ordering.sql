-- 20241003_lexorank_ordering.sql
-- Add LexoRank (TEXT) column for ordering to avoid cascade updates
-- Projects & Portfolio
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS rank text;
CREATE INDEX IF NOT EXISTS idx_projects_rank ON public.projects (rank);
ALTER TABLE public.portfolio
ADD COLUMN IF NOT EXISTS rank text;
CREATE INDEX IF NOT EXISTS idx_portfolio_rank ON public.portfolio (rank);
-- Services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS rank text;
CREATE INDEX IF NOT EXISTS idx_services_rank ON public.services (rank);
-- Service Steps
ALTER TABLE public.service_steps
ADD COLUMN IF NOT EXISTS rank text;
CREATE INDEX IF NOT EXISTS idx_service_steps_rank ON public.service_steps (rank);
-- Service FAQs
ALTER TABLE public.service_faqs
ADD COLUMN IF NOT EXISTS rank text;
CREATE INDEX IF NOT EXISTS idx_service_faqs_rank ON public.service_faqs (rank);
-- Note: Application code must generate LexoRank strings when inserting/reordering.