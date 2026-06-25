import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

let envFile = '.env';
if (fs.existsSync('.env.local')) {
    envFile = '.env.local';
}
dotenv.config({ path: envFile });

// Fallback to reading raw strings if not loaded properly
const envContent = fs.readFileSync(envFile, 'utf-8');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    const match = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.*)/);
    if (match) supabaseUrl = match[1].replace(/['"]/g, '');
}
if (!supabaseKey) {
    const match = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.*)/);
    if (match) supabaseKey = match[1].replace(/['"]/g, '');
}

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newAssets = [
  {
    asset_key: 'project_gallery_fallback_1',
    description: 'Project Gallery Walkthrough Entry 1 Image',
  },
  {
    asset_key: 'project_gallery_fallback_2',
    description: 'Project Gallery Walkthrough Entry 2 Image',
  },
  {
    asset_key: 'project_gallery_fallback_3',
    description: 'Project Gallery Walkthrough Entry 3 Image',
  },
  {
    asset_key: 'project_gallery_fallback_4',
    description: 'Project Gallery Walkthrough Entry 4 Image',
  },
  {
    asset_key: 'blog_newsletter_bg',
    description: 'Background image for the newsletter signup card on the Blog Page',
  },
  {
    asset_key: 'location_hero_bg',
    description: 'Background image for the Location page hero section',
  },
  {
    asset_key: 'discovery_welcome',
    description: 'Background image for the Discovery engine Welcome Screen',
  }
];

async function seed() {
  for (const asset of newAssets) {
    const { data, error } = await supabase
      .from('site_media_assets')
      .upsert(asset, { onConflict: 'asset_key' });
      
    if (error) {
      console.error(`Failed to insert ${asset.asset_key}:`, error);
    } else {
      console.log(`Successfully seeded ${asset.asset_key}`);
    }
  }
}

seed();
