-- Add missing GIN indexes on JSONB and text array columns for performance scaling
-- Ensure page_sections.content_json has a GIN index (if not already added by 08)
DO $$ BEGIN IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'page_sections' AND column_name = 'content_json'
) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_sections_content_json_gin ON public.page_sections USING gin (content_json);';
END IF; END $$;

-- Ensure blogs.content_json has a GIN index for full-text / structural search within rich text
DO $$ BEGIN IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blogs' AND column_name = 'content_json'
) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_blogs_content_json_gin ON public.blogs USING gin (content_json);';
END IF; END $$;

-- Add a GIN index on estimate_leads for the estimate_breakdown JSONB column 
CREATE INDEX IF NOT EXISTS idx_estimate_leads_breakdown_gin ON public.estimate_leads USING gin (estimate_breakdown);
-- Assuming projects might have a JSONB 'extra' or similar, we gracefully attempt it if such a column exists
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'projects'
        AND column_name = 'extra'
        AND data_type = 'jsonb'
) THEN CREATE INDEX IF NOT EXISTS idx_projects_extra_gin ON public.projects USING gin (extra);
END IF;
END $$;