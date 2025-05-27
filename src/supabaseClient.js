import { createClient } from '@supabase/supabase-js';

// For Vite, environment variables must be prefixed with VITE_
// and are accessed via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  // You could throw an error here or handle it gracefully
  // For now, let's log and allow createClient to potentially fail and show its own error
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 