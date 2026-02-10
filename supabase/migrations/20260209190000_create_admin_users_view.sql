-- Function to get all users details (for admin usage)
-- Created safely after tracking function
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    banned_until TIMESTAMPTZ,
    role public.app_role,
    status TEXT
) 
SECURITY DEFINER
SET search_path = public, auth 
LANGUAGE plpgsql
AS $$
DECLARE
    is_admin boolean;
BEGIN
    -- Check if the caller is an admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        au.email::TEXT,
        au.last_sign_in_at,
        au.created_at,
        au.banned_until,
        COALESCE(ur.role, 'viewer'::public.app_role) as role,
        CASE 
            WHEN au.banned_until IS NOT NULL AND au.banned_until > NOW() THEN 'suspended'
            ELSE 'active'
        END::TEXT as status
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    ORDER BY au.created_at DESC;
END;
$$;
