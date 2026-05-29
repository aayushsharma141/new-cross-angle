/**
 * cleanup_mixed_reviews.cjs
 * 
 * Removes section-specific reviews that were accidentally inserted into the
 * general testimonials table. These reviews belong to:
 *   - BeforeAfterShowcase (transformationStories.ts) → display_order 13, 14, 15
 *   - ProjectPage (projects.ts)                      → display_order 16, 17, 18
 *
 * Keeps only the 3 general homepage reviews (display_order 10, 11, 12):
 *   - Priya Sharma (general client)
 *   - Rajesh Kumar (general client)
 *   - Anita Desai  (general client)
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// These are the author_name values that belong to section-specific contexts,
// NOT the general testimonials section. Match by name to handle multiple inserts.
const SECTION_SPECIFIC_AUTHORS = [
  // From transformationStories.ts (Before & After section)
  'Rahul & Megha',
  'The Senguptas',
  'Vikram S.',
  // From projects.ts (Project pages)
  'Mrs. Sharma',
  'Mrs. Desai',
  'Vikram Singh',
];

async function main() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL || 'sharma1.aayu@gmail.com',
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || 'cross1@AS',
  });

  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }
  console.log('Logged in as:', authData.user.email);

  // First: show what's currently in the table
  const { data: all, error: fetchErr } = await supabase
    .from('testimonials')
    .select('id, author_name, display_order, active')
    .order('display_order', { ascending: true });

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    return;
  }

  console.log('\nCurrent testimonials in DB:');
  all.forEach(t => {
    const isSection = SECTION_SPECIFIC_AUTHORS.includes(t.author_name);
    console.log(`  [${t.display_order}] ${t.author_name} ${isSection ? '← WILL DELETE (section-specific)' : '✓ KEEP (general)'}`);
  });

  // Delete all section-specific ones
  console.log('\nDeleting section-specific reviews...');
  for (const name of SECTION_SPECIFIC_AUTHORS) {
    const { data: deleted, error } = await supabase
      .from('testimonials')
      .delete()
      .eq('author_name', name)
      .select('id, author_name');

    if (error) {
      console.error(`  ✗ Error deleting "${name}":`, error.message);
    } else if (deleted && deleted.length > 0) {
      console.log(`  ✓ Deleted ${deleted.length} row(s) for "${name}"`);
    } else {
      console.log(`  - No rows found for "${name}" (already clean)`);
    }
  }

  // Show final state
  const { data: remaining } = await supabase
    .from('testimonials')
    .select('id, author_name, display_order')
    .order('display_order', { ascending: true });

  console.log('\nFinal testimonials remaining (general homepage reviews):');
  (remaining || []).forEach(t => {
    console.log(`  [${t.display_order}] ${t.author_name}`);
  });

  console.log('\nDone! The homepage Testimonials section will now only show general client reviews.');
  console.log('Before & After and Project sections already use their own hardcoded data.');
}

main();
