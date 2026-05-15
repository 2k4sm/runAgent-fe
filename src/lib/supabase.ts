import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface misconfiguration early rather than failing opaquely on first auth call.
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env file.')
}

/** Shared Supabase client. Auth is the only feature used; all data goes via the backend. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
