-- 20241001_create_is_admin_function.sql
-- Creates a trusted function for admin role checks
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = uid
            AND role = 'admin'
    );
$$;