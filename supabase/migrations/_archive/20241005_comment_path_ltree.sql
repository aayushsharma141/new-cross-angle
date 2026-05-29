-- 20241005_comment_path_ltree.sql
-- Create comments table and add a materialized path column for O(1) thread retrieval
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- Enable ltree extension for path-style queries
CREATE EXTENSION IF NOT EXISTS ltree;
-- Add path column (text, ltree compatible)
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS path ltree;
-- Populate existing rows: leaf nodes (no parent) get path = id cast to ltree label
UPDATE public.comments
SET path = subpath(text2ltree(replace(id::text, '-', '')), 0)
WHERE parent_id IS NULL;
-- Trigger to auto-set path on INSERT
CREATE OR REPLACE FUNCTION public.set_comment_path() RETURNS trigger AS $$ BEGIN IF NEW.parent_id IS NULL THEN NEW.path := subpath(text2ltree(replace(NEW.id::text, '-', '')), 0);
ELSE
SELECT path || subpath(text2ltree(replace(NEW.id::text, '-', '')), 0) INTO NEW.path
FROM public.comments
WHERE id = NEW.parent_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_set_comment_path ON public.comments;
CREATE TRIGGER trg_set_comment_path BEFORE
INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_comment_path();
-- GiST index for fast subtree queries (path <@ 'root.child')
CREATE INDEX IF NOT EXISTS idx_comments_path ON public.comments USING GIST (path);