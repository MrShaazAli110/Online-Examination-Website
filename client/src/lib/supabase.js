import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qyqmkxsgmcqwufoagxfc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YZ9oQpiHE9nJmrhPZCNUEQ_0I_aonv6';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('http') && 
  supabaseKey.trim().length > 10
);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase configuration missing or invalid. Check client/.env');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
