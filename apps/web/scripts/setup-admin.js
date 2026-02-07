// Supabase Admin Setup Script
// Run with: node scripts/setup-admin.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iuuivmwqodefdrrrewol.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWl2bXdxb2RlZmRycnJld29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI4ODk2NCwiZXhwIjoyMDgyODY0OTY0fQ.DbvyfigJo7s4MAKWWQerWjSAiJqmkT79YI3AP-C38Yw';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const ADMIN_EMAIL = 'sharma1.aayu@gmail.com';
const ADMIN_PASSWORD = 'Cross@123';

async function createAdminUser() {
    console.log('\n========================================');
    console.log('🚀 SUPABASE ADMIN SETUP');
    console.log('========================================\n');

    console.log(`👤 Creating admin user: ${ADMIN_EMAIL}...\n`);

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    const existingUser = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL);

    let userId;

    if (existingUser) {
        console.log('✅ User already exists, updating password...');
        userId = existingUser.id;

        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: ADMIN_PASSWORD,
            email_confirm: true
        });

        if (updateError) {
            console.error('Error updating user:', updateError.message);
        } else {
            console.log('✅ Password updated successfully');
        }
    } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError.message);
            return;
        }

        userId = newUser.user.id;
        console.log('✅ User created successfully');
    }

    console.log(`\n📋 User ID: ${userId}`);

    // First, ensure user_roles table exists
    console.log('\n🔐 Setting up user_roles table...');

    // Try to create the table using raw SQL via the REST API
    const createTableResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({})
    });

    // Now try to assign admin role
    console.log('\n🔐 Assigning admin role...');

    // Check if role exists
    const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (roleCheckError && roleCheckError.code === '42P01') {
        // Table doesn't exist - we need to create it via SQL Editor
        console.log('\n⚠️  user_roles table does not exist.');
        console.log('Please run this SQL in Supabase SQL Editor:\n');
        console.log('----------------------------------------');
        console.log(`
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage roles" ON user_roles
  FOR ALL USING (true);

INSERT INTO user_roles (user_id, role)
VALUES ('${userId}', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    `);
        console.log('----------------------------------------\n');
    } else if (existingRole) {
        // Update existing role
        const { error: updateRoleError } = await supabase
            .from('user_roles')
            .update({ role: 'admin' })
            .eq('user_id', userId);

        if (updateRoleError) {
            console.error('Error updating role:', updateRoleError.message);
        } else {
            console.log('✅ Admin role updated');
        }
    } else {
        // Insert new role
        const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' });

        if (insertRoleError) {
            console.error('Error inserting role:', insertRoleError.message);
            console.log('\n⚠️  Could not assign role. Please run SQL manually (shown above).');
        } else {
            console.log('✅ Admin role assigned');
        }
    }

    console.log('\n========================================');
    console.log('🎉 SETUP COMPLETE!');
    console.log('========================================');
    console.log(`\nAdmin Login Credentials:`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`\nLogin at: http://localhost:8081/admin/auth`);
    console.log('========================================\n');
}

createAdminUser().catch(console.error);
