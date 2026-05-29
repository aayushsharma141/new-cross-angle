const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const stages = ['new', 'in_conversation', 'meeting_planned', 'quote_sent', 'won'];

async function main() {
  console.log("Fetching leads...");
  const { data: leads, error } = await supabase.from('leads').select('id, status');
  
  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }
  
  console.log(`Found ${leads.length} leads. Redistributing them...`);
  
  let i = 0;
  for (const lead of leads) {
    const newStatus = stages[i % stages.length];
    i++;
    
    if (lead.status !== newStatus) {
      console.log(`Moving lead ${lead.id} to ${newStatus}`);
      const { error: updateError } = await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);
      if (updateError) {
        console.error(`Error updating lead ${lead.id}:`, updateError);
      }
    }
  }
  
  console.log("Finished moving leads.");
}

main();
