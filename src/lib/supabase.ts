import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface misconfiguration early rather than failing opaquely on first auth call.
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env file.')
}

/**
 * In-tab async lock replacing Supabase's default `navigator.locks` lock, which
 * can deadlock on reload in Chrome and hang auth init forever. Serialises auth
 * operations within the tab without touching `navigator.locks`.
 */
const lockChains = new Map<string, Promise<unknown>>()

function inTabLock<R>(name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> {
  const prev = lockChains.get(name) ?? Promise.resolve()
  const run = prev.then(fn, fn)
  lockChains.set(
    name,
    run.then(
      () => undefined,
      () => undefined,
    ),
  )
  return run
}

/** Shared Supabase client. Auth is the only feature used; all data goes via the backend. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: inTabLock,
  },
})
