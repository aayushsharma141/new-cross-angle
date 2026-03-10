import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'sharma1.aayu@gmail.com',
        password: 'cross1@AS'
    });

    if (authError) {
        console.error('Login Failed:', authError);
        return;
    }

    console.log('Fetching categories...');
    const { data: categories, error } = await supabase.from('project_categories').select('*');
    if (error) {
        console.error(error);
    } else {
        console.log('Categories:', categories);
    }
}
run();
