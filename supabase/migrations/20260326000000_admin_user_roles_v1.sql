BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'app_role'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = 'app_role'
              AND e.enumlabel = 'admin'
        ) AND NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = 'app_role'
              AND e.enumlabel = 'super_admin'
        ) THEN
            ALTER TYPE public.app_role RENAME VALUE 'admin' TO 'super_admin';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = 'app_role'
              AND e.enumlabel = 'editor'
        ) AND NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = 'app_role'
              AND e.enumlabel = 'admin'
        ) THEN
            ALTER TYPE public.app_role RENAME VALUE 'editor' TO 'admin';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = 'app_role'
              AND e.enumlabel = 'viewer'
        ) THEN
            ALTER TYPE public.app_role ADD VALUE 'viewer';
        END IF;
    END IF;
END $$;

COMMIT;
BEGIN;

ALTER TABLE IF EXISTS public.user_roles
    ALTER COLUMN role SET DEFAULT 'viewer'::public.app_role;

WITH ranked_roles AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY CASE role
                WHEN 'super_admin'::public.app_role THEN 1
                WHEN 'admin'::public.app_role THEN 2
                ELSE 3
            END
        ) AS row_num
    FROM public.user_roles
)
DELETE FROM public.user_roles ur
USING ranked_roles rr
WHERE ur.id = rr.id
  AND rr.row_num > 1;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_key
    ON public.user_roles (user_id);

DO $$
DECLARE
    role_check_name text;
    status_check_name text;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'profiles'
              AND column_name = 'role'
        ) THEN
            UPDATE public.profiles
            SET role = CASE role
                WHEN 'admin' THEN 'super_admin'
                WHEN 'editor' THEN 'admin'
                WHEN 'user' THEN 'viewer'
                ELSE role
            END;

            SELECT conname
            INTO role_check_name
            FROM pg_constraint
            WHERE conrelid = 'public.profiles'::regclass
              AND contype = 'c'
              AND pg_get_constraintdef(oid) ILIKE '%role%';

            IF role_check_name IS NOT NULL THEN
                EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', role_check_name);
            END IF;

            ALTER TABLE public.profiles
                ALTER COLUMN role SET DEFAULT 'viewer';

            ALTER TABLE public.profiles
                ADD CONSTRAINT profiles_role_check
                CHECK (role IN ('super_admin', 'admin', 'viewer'));
        END IF;

        ALTER TABLE public.profiles
            ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
            ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

        UPDATE public.profiles
        SET status = 'active'
        WHERE status IS NULL
           OR status NOT IN ('active', 'inactive');

        SELECT conname
        INTO status_check_name
        FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%status%';

        IF status_check_name IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', status_check_name);
        END IF;

        ALTER TABLE public.profiles
            ALTER COLUMN status SET DEFAULT 'active';

        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_status_check
            CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('super_admin', 'admin')
    )
$$;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles" ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_logs') THEN
        DROP POLICY IF EXISTS "Admins can manage system_logs" ON public.system_logs;
        DROP POLICY IF EXISTS "Super admins can manage system_logs" ON public.system_logs;
        CREATE POLICY "Super admins can manage system_logs" ON public.system_logs
            FOR ALL
            TO authenticated
            USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'website_events') THEN
        DROP POLICY IF EXISTS "Admins can manage website_events" ON public.website_events;
        DROP POLICY IF EXISTS "Super admins can manage website_events" ON public.website_events;
        CREATE POLICY "Super admins can manage website_events" ON public.website_events
            FOR ALL
            TO authenticated
            USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_sessions') THEN
        DROP POLICY IF EXISTS "Admins can manage sessions" ON public.admin_sessions;
        DROP POLICY IF EXISTS "Super admins can manage sessions" ON public.admin_sessions;
        CREATE POLICY "Super admins can manage sessions" ON public.admin_sessions
            FOR ALL
            TO authenticated
            USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cms_sections') THEN
        DROP POLICY IF EXISTS "Admins can manage cms_sections" ON public.cms_sections;
        DROP POLICY IF EXISTS "Super admins can manage cms_sections" ON public.cms_sections;
        CREATE POLICY "Super admins can manage cms_sections" ON public.cms_sections
            FOR ALL
            TO authenticated
            USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
    id uuid,
    full_name text,
    avatar_url text,
    email text,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    role public.app_role,
    status text,
    deleted_at timestamptz
)
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
    caller_role public.app_role;
BEGIN
    SELECT role
    INTO caller_role
    FROM public.user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;

    IF caller_role IS NULL OR caller_role NOT IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT
        au.id,
        p.full_name,
        p.avatar_url,
        au.email::text,
        au.last_sign_in_at,
        COALESCE(p.created_at, au.created_at),
        COALESCE(ur.role, 'viewer'::public.app_role) AS role,
        CASE
            WHEN p.deleted_at IS NOT NULL THEN 'deleted'
            WHEN COALESCE(p.status, 'active') = 'inactive' THEN 'inactive'
            WHEN au.banned_until IS NOT NULL AND au.banned_until > now() THEN 'inactive'
            ELSE 'active'
        END::text AS status,
        p.deleted_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    LEFT JOIN public.user_roles ur ON ur.user_id = au.id
    ORDER BY au.created_at DESC;
END;
$$;

COMMIT;
