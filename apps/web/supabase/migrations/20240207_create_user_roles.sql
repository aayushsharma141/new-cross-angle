-- Run this in Supabase SQL Editor
-- Creates the user_roles table and assigns admin role

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
CREATE POLICY "Service role full access" ON public.user_roles
  FOR ALL USING (true);

-- 4. Assign admin role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('d5aba90d-2c63-4603-b2ec-210902bafddf', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 5. Verify
SELECT * FROM public.user_roles;
