import { createClient } from '@supabase/supabase-js';

// Define Database type or import it if available. For now, using any to avoid errors during migration.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
      }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : null as any;
