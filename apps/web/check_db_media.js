import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
// We bypass the storage list APIs completely and go straight to the backend tables using the db credentials to see exactly what buckets and items are actually stored within the raw SQL schemas.
// The public service key bypasses RLS
const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '');

async function run() {
    console.log('Logging in to db reader...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'sharma1.aayu@gmail.com',
        password: 'cross1@AS'
    });

    if (authError) {
        console.log("auth failed");
        return;
    }

    console.log("Checking the raw database media tables:");
    const { data: mediaData, error: mediaError } = await supabase.from('media').select('*');

    if (mediaError) {
        console.log("Could not find media table, or not authorized.");
    } else {
        console.log(`Found ${mediaData.length} records in the 'media' standard postgres table.`);
        mediaData.forEach(f => {
            console.log(` - ID: ${f.id} , url: ${f.url} `);
        });
    }
}

run();
