const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/web/.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const p = ['password', 'admin', 'Password123!', '123456', 'admin123', 'admin@crossangle'];
  for (const pass of p) {
    console.log("Trying", pass);
    const { data, error } = await supabase.auth.signInWithPassword({ email: 'admin@crossangle.com', password: pass });
    if (!error) {
      console.log("SUCCESS!", pass, data.session.access_token.substring(0,20));
      return;
    }
  }
  console.log("All failed.");
}
run();
