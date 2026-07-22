import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from apps/web
dotenv.config({ path: path.resolve('apps/web/.env') });
dotenv.config({ path: path.resolve('apps/web/.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// We need the service role key to bypass RLS and read all data easily
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking leads...");
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .eq('email', 'testnode@example.com')
    .order('created_at', { ascending: false })
    .limit(1);

  if (leadsError) {
    console.error("Leads query error:", leadsError);
  } else {
    console.log("Latest Test Lead:", JSON.stringify(leads, null, 2));
  }
  
  console.log("\nChecking system logs for errors in last 5 minutes...");
  const { data: logs, error: logsError } = await supabase
    .from('system_logs')
    .select('*')
    .eq('status', 'error')
    .order('created_at', { ascending: false })
    .limit(5);

  if (logsError) {
    console.error("Logs query error:", logsError);
  } else {
    console.log("Recent System Errors:", JSON.stringify(logs, null, 2));
  }
  
  console.log("\nChecking website events...");
  const { data: events, error: eventsError } = await supabase
    .from('website_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (eventsError) {
    console.error("Events query error:", eventsError);
  } else {
    console.log("Recent Website Events:", JSON.stringify(events, null, 2));
  }
}

run();
