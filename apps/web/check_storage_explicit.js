import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'sharma1.aayu@gmail.com',
        password: 'cross1@AS'
    });

    if (authError) {
        console.error('Login Failed:', authError);
        return;
    }

    console.log('Logged in successfully! Fetching explicitly from media bucket...');

    const foldersToTry = ['', 'general', 'portfolio', 'services', 'blogs'];

    for (const folder of foldersToTry) {
        console.log(`\n--- Fetching folder: '${folder}' ---`);
        const { data: files, error: filesError } = await supabase
            .storage
            .from('media')
            .list(folder, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (filesError) {
            console.error(`Error listing files in media/${folder}:`, filesError.message);
        } else if (!files || files.length === 0) {
            console.log('No files found.');
        } else {
            for (const file of files) {
                if (file.name === '.emptyFolderPlaceholder') continue;
                console.log(`- ${folder ? folder + '/' : ''}${file.name} (${Math.round((file.metadata?.size || 0) / 1024)} kb)`);
            }
        }
    }
}

checkStorage();
