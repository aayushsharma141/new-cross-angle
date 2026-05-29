
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGalleryUrls() {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('image_url')
    .limit(10);

  if (error) {
    console.error('Error fetching gallery items:', error);
    return;
  }

  console.log('Sample Gallery URLs:');
  data.forEach(item => console.log(item.image_url));
}

checkGalleryUrls();
