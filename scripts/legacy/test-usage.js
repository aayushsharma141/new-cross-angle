import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'apps/web/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Fetching first ready asset...');
  const { data: assets, error: assetError } = await supabase
    .from('assets')
    .select('id, title')
    .eq('status', 'ready')
    .limit(1);

  if (assetError || !assets || assets.length === 0) {
    console.error('Error or no assets found:', assetError);
    return;
  }

  const assetId = assets[0].id;
  console.log(`Found asset: ${assets[0].title} (${assetId})`);

  console.log('Inserting/Replacing asset usage for Warm Modernist hero slot...');
  // Delete existing usage for this slot if any
  await supabase
    .from('asset_usages')
    .delete()
    .eq('entity_type', 'archetype')
    .eq('entity_id', 'arch_warm_modernist')
    .eq('role', 'hero');

  // Insert new usage
  const { data: usage, error: usageError } = await supabase
    .from('asset_usages')
    .insert({
      asset_id: assetId,
      domain: 'discovery',
      entity_type: 'archetype',
      entity_id: 'arch_warm_modernist',
      role: 'hero'
    })
    .select();

  if (usageError) {
    console.error('Error inserting usage:', usageError);
  } else {
    console.log('Successfully inserted usage:', usage);
  }
}

run();
