require('dotenv').config({ path: 'apps/web/.env.local' });
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const spec = await res.json();
  fs.writeFileSync('schema.json', JSON.stringify(spec, null, 2));
  console.log("Written to schema.json");
}

run();
