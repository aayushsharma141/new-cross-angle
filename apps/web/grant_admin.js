import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeAdmin() {
    const email = 'sharma1.aayu@gmail.com';

    // 1. Get user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.log('User not found!');
        return;
    }

    console.log(`Found user: ${user.id} (${user.email})`);

    // 2. Check current roles
    const { data: roles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

    console.log('Current roles:', roles);

    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'super_admin');

    if (!isAdmin) {
        console.log('Granting admin role...');
        // 3. Insert admin role
        const { error: insertError } = await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: user.id, role: 'admin' });

        if (insertError) {
            console.error('Error inserting role:', insertError);
        } else {
            console.log('Successfully made admin!');
        }
    } else {
        console.log('User is already an admin.');
    }
}

makeAdmin();
