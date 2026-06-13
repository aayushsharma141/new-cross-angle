import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Creating folders...");
    
    // 1. Create 'Discovery Engine' folder
    const { data: rootFolder, error: err1 } = await supabase.from('media_folders').insert({
        name: 'Discovery Engine',
        parent_id: null
    }).select().single();
    if (err1) throw err1;
    console.log("Created:", rootFolder.name);

    // 2. Create 'Visual Instinct' folder
    const { data: visualFolder, error: err2 } = await supabase.from('media_folders').insert({
        name: 'Visual Instinct',
        parent_id: rootFolder.id
    }).select().single();
    if (err2) throw err2;
    console.log("Created:", visualFolder.name);
    
    // 3. Create 'Lifestyle Questions' folder
    const { data: lifestyleFolder, error: err3 } = await supabase.from('media_folders').insert({
        name: 'Lifestyle Questions',
        parent_id: rootFolder.id
    }).select().single();
    if (err3) throw err3;
    console.log("Created:", lifestyleFolder.name);

    // Move visual-* files
    const { data: visualFiles } = await supabase.from('media_files').select('id, display_name').like('display_name', 'visual-%');
    if (visualFiles?.length) {
        const { error } = await supabase.from('media_files').update({ folder_id: visualFolder.id }).in('id', visualFiles.map(f => f.id));
        if (error) console.error("Error moving visual files:", error);
        else console.log(`Moved ${visualFiles.length} files to Visual Instinct`);
    }

    // Move lifestyle-* files
    const { data: lifestyleFiles } = await supabase.from('media_files').select('id, display_name').like('display_name', 'lifestyle-%');
    if (lifestyleFiles?.length) {
        const { error } = await supabase.from('media_files').update({ folder_id: lifestyleFolder.id }).in('id', lifestyleFiles.map(f => f.id));
        if (error) console.error("Error moving lifestyle files:", error);
        else console.log(`Moved ${lifestyleFiles.length} files to Lifestyle Questions`);
    }

    console.log("Organization complete!");
}

main().catch(console.error);
