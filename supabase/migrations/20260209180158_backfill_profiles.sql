-- Backfill existing users into profiles table
INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
SELECT 
  id, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url',
  NOW()
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url;
