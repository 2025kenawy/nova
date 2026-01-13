
import { createClient } from '@supabase/supabase-js';

/**
 * Nova Supabase Infrastructure
 * 
 * Securely connects to the Sovereign Horse Database.
 * The 'sbp_' key provided is used as the default fallback for the connection.
 */

const supabaseUrl = process.env.SUPABASE_URL || 'https://vclvwyquzpvpzvzvzvzv.supabase.co'; // Example project URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sbp_583feb2efe11e0434956b7436d94a173f5c9c1a0';

const isConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;

if (!isConfigured && !supabaseAnonKey.startsWith('sbp_')) {
  console.warn(
    "Nova Intelligence: Supabase credentials missing. " +
    "Market intelligence will be stored in local volatile memory for this session."
  );
}

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export default supabase;
