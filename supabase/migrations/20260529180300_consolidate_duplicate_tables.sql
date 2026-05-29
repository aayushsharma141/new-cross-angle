-- =============================================================
-- CONSOLIDATE DUPLICATE TABLES
-- 1. Migrate blogs -> blog_posts (by slug, skip duplicates)
-- 2. Rename blogs -> _blogs_deprecated
-- 3. Migrate media_assets -> media (by filename, skip duplicates)
-- 4. Rename media_assets -> _media_assets_deprecated
-- 5. Drop RLS policies on deprecated tables
-- =============================================================

BEGIN;

-- ─── 1. MIGRATE blogs → blog_posts ───────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blogs')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts')
  THEN
    INSERT INTO public.blog_posts (title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at, author_id)
    SELECT
      b.title,
      b.slug,
      b.excerpt,
      -- blog_posts.content is JSONB; wrap plain text in a basic tiptap doc structure
      CASE
        WHEN b.content_json IS NOT NULL THEN b.content_json
        WHEN b.content IS NOT NULL THEN jsonb_build_object('type', 'doc', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', b.content)))))
        ELSE NULL
      END,
      b.cover_image,
      CASE
        WHEN b.status = 'published' OR b.is_published = true THEN 'published'
        WHEN b.status = 'archived' THEN 'draft'
        ELSE 'draft'
      END,
      b.published_at,
      b.created_at,
      b.updated_at,
      b.author_id
    FROM public.blogs b
    WHERE NOT EXISTS (
      SELECT 1 FROM public.blog_posts bp WHERE bp.slug = b.slug
    );
  END IF;
END $$;

-- ─── 2. DROP POLICIES & RENAME blogs ─────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blogs') THEN
    -- Drop all known policies
    DROP POLICY IF EXISTS "Anyone can read published blogs" ON public.blogs;
    DROP POLICY IF EXISTS "Admins and editors can manage blogs" ON public.blogs;
    DROP POLICY IF EXISTS "admin_write_blogs" ON public.blogs;
    DROP POLICY IF EXISTS "authenticated_read_blogs" ON public.blogs;
    DROP POLICY IF EXISTS "admin_insert_blogs" ON public.blogs;
    DROP POLICY IF EXISTS "admin_update_blogs" ON public.blogs;
    DROP POLICY IF EXISTS "admin_delete_blogs" ON public.blogs;
    DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
    DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON public.blogs;
    DROP POLICY IF EXISTS "Admin all blogs" ON public.blogs;

    -- Drop triggers
    DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
    DROP TRIGGER IF EXISTS audit_blogs ON public.blogs;

    -- Drop indexes
    DROP INDEX IF EXISTS public.idx_blogs_status;
    DROP INDEX IF EXISTS public.idx_blogs_slug;
    DROP INDEX IF EXISTS public.idx_blogs_content_json_gin;

    -- Rename table
    ALTER TABLE public.blogs RENAME TO _blogs_deprecated;
  END IF;
END $$;

-- ─── 3. MIGRATE media_assets → media ─────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_assets')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media')
  THEN
    INSERT INTO public.media (url, file_name, file_type, size_bytes, alt, uploaded_by, created_at)
    SELECT
      ma.url,
      ma.filename,
      ma.mime_type,
      ma.size_bytes::bigint,
      ma.alt_text,
      ma.uploaded_by,
      ma.created_at
    FROM public.media_assets ma
    WHERE NOT EXISTS (
      SELECT 1 FROM public.media m WHERE m.file_name = ma.filename
    );
  END IF;
END $$;

-- ─── 4. DROP POLICIES & RENAME media_assets ──────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_assets') THEN
    -- Drop all known policies
    DROP POLICY IF EXISTS "Public read media_assets" ON public.media_assets;
    DROP POLICY IF EXISTS "Admin all media_assets" ON public.media_assets;

    -- Rename table
    ALTER TABLE public.media_assets RENAME TO _media_assets_deprecated;
  END IF;
END $$;

COMMIT;
