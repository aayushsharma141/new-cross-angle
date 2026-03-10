import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncStorage() {
    console.log('Logging in to sync storage...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'sharma1.aayu@gmail.com',
        password: 'cross1@AS'
    });

    if (authError) {
        console.log("auth failed");
        return;
    }

    const { data: files } = await supabase.storage.from('media').list('general', { limit: 100 });

    if (!files || files.length === 0) return console.log('No files to sync');

    for (const file of files) {
        if (file.name === '.emptyFolderPlaceholder') continue;

        const path = `general/${file.name}`;
        const { data: publicUrlObj } = supabase.storage.from('media').getPublicUrl(path);

        // Upsert into DB
        const { error: dbError } = await supabase.from('media').insert({
            url: publicUrlObj.publicUrl,
            file_name: path,
            file_type: file.metadata?.mimetype || 'image/jpeg',
            size_bytes: file.metadata?.size || 0,
            alt: file.name,
            title: file.name,
            uploaded_by: authData.user.id
        });

        if (dbError && dbError.code !== '23505') {
            console.error(`Failed mapping ${file.name}`, dbError.message);
        } else {
            console.log(`Synced ${file.name}`);
        }
    }

    console.log('Finished syncing storage to DB!');
}

syncStorage();
