const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// We need the service role key or anon key to query, wait, anon key has RLS.
// We can use service_role key to bypass RLS for verification.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log("=== Verifying Data Pipeline ===");
  
  // 1. Check Leads
  const { data: leads, error: leadsErr } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (leadsErr) console.error("Leads error:", leadsErr);
  console.log("\n[1] Latest Lead:", leads ? JSON.stringify(leads[0], null, 2) : "None");

  // 2. Check Analytics Events
  const { data: events, error: eventsErr } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (eventsErr) console.error("Events error:", eventsErr);
  console.log("\n[2] Latest Analytics Events:", events ? JSON.stringify(events, null, 2) : "None");

  // 3. Check Decision Events
  const { data: decision, error: decisionErr } = await supabase
    .from('decision_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2);
    
  if (decisionErr) console.error("Decision events error:", decisionErr);
  console.log("\n[3] Latest Decision Events:", decision ? JSON.stringify(decision, null, 2) : "None");
}

verify();
