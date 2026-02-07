// Execute SQL via Supabase Management API
// Run with: node scripts/execute-sql.js

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWl2bXdxb2RlZmRycnJld29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI4ODk2NCwiZXhwIjoyMDgyODY0OTY0fQ.DbvyfigJo7s4MAKWWQerWjSAiJqmkT79YI3AP-C38Yw';
const projectRef = 'iuuivmwqodefdrrrewol';

const sql = `
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

-- 3. Create policies (drop first to avoid duplicates)
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
`;

async function executeSql() {
    console.log('🔧 Executing SQL to create user_roles table and assign admin role...\n');

    // Using Supabase REST API with service role to execute SQL
    // Note: We'll use the pg_query endpoint if available, otherwise raw SQL via RPC

    try {
        // Try using supabase-js with service role to insert directly after creating table via fetch
        const url = `https://${projectRef}.supabase.co/rest/v1/rpc/`;

        // Supabase doesn't have a direct SQL execution endpoint via REST API
        // We need to use the Database Functions approach or Management API

        // Alternative: Use the Supabase Database API directly
        const dbUrl = `https://${projectRef}.supabase.co`;

        // Create a minimal postgres client wrapper using fetch
        const response = await fetch(`${dbUrl}/rest/v1/user_roles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                user_id: 'd5aba90d-2c63-4603-b2ec-210902bafddf',
                role: 'admin'
            })
        });

        if (response.ok) {
            console.log('✅ Admin role assigned via REST API!');
        } else {
            const errorText = await response.text();
            console.log('REST API response:', response.status, errorText);

            if (errorText.includes('user_roles')) {
                console.log('\n⚠️  The user_roles table needs to be created first.');
                console.log('Please run the following SQL in Supabase Dashboard > SQL Editor:\n');
                console.log('----------------------------------------');
                console.log(sql);
                console.log('----------------------------------------');
                console.log('\nGo to: https://supabase.com/dashboard/project/iuuivmwqodefdrrrewol/sql/new');
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }

    console.log('\n========================================');
    console.log('📋 QUICK SETUP INSTRUCTIONS:');
    console.log('========================================');
    console.log('\n1. Open: https://supabase.com/dashboard/project/iuuivmwqodefdrrrewol/sql/new');
    console.log('\n2. Paste and run this SQL:\n');
    console.log(sql);
    console.log('\n3. Then login at: http://localhost:8081/admin/auth');
    console.log('   Email: sharma1.aayu@gmail.com');
    console.log('   Password: Cross@123');
    console.log('\n========================================\n');
}

executeSql();
