const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabaseUrl or supabaseKey");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    // Let me just read email from arguments, or hardcode it
    // I don't know the user's password, so I'll just check if the client initialized correctly 
    // and see if I can query a public table.
    const { data, error } = await supabase.from('services').select('*').limit(1);
    if (error) {
        console.error("Error querying:", error);
    } else {
        console.log("Successfully connected to Supabase and queried. Services count:", data?.length);
    }
}

testLogin();
