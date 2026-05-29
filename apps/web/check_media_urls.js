
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMediaUrls() {
  const { data, error } = await supabase
    .from('media')
    .select('url, file_name')
    .ilike('url', '%ik.imagekit.io%')
    .limit(10);

  if (error) {
    console.error('Error fetching media items:', error);
    return;
  }

  console.log('Sample ImageKit Media URLs:');
  data.forEach(item => console.log(`${item.file_name}: ${item.url}`));
}

checkMediaUrls();
