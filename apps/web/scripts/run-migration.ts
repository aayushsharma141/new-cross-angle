import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Starting ImageKit migration...");
  try {
    const { data, error } = await supabase.functions.invoke("migrate-to-imagekit", {
      body: {
        limit: 100,
        skipExisting: true,
      },
    });

    if (error) {
      throw error;
    }

    console.log("Migration successful:", data);
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
