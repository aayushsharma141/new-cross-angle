/**
 * dedup_reviews.cjs
 * Removes exact duplicate testimonials (same author_name + content),
 * keeping the oldest row (lowest created_at) per group.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function main() {
  console.log('Logging in...');
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL || 'sharma1.aayu@gmail.com',
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || 'cross1@AS',
  });
  if (authError) { console.error(authError.message); return; }

  const { data: all } = await supabase
    .from('testimonials')
    .select('id, author_name, content, created_at')
    .order('created_at', { ascending: true });

  // Group by author_name+content fingerprint, keep first (oldest), delete rest
  const seen = new Map(); // fingerprint -> id to keep
  const toDelete = [];

  for (const row of (all || [])) {
    const key = `${row.author_name.toLowerCase().trim()}|${row.content.trim().slice(0, 80)}`;
    if (seen.has(key)) {
      toDelete.push(row.id);
    } else {
      seen.set(key, row.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('No duplicates found — DB is already clean.');
    return;
  }

  console.log(`Found ${toDelete.length} duplicate rows to delete...`);
  const { error } = await supabase.from('testimonials').delete().in('id', toDelete);
  if (error) console.error('Delete error:', error.message);
  else console.log(`✓ Deleted ${toDelete.length} duplicate rows.`);

  const { data: final } = await supabase
    .from('testimonials')
    .select('id, author_name, display_order')
    .order('display_order', { ascending: true });

  console.log('\nFinal clean list:');
  (final || []).forEach(t => console.log(`  [${t.display_order}] ${t.author_name}`));
}

main();
