import { createClient, NavigatorLockAcquireTimeoutError } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface misconfiguration early rather than failing opaquely on first auth call.
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env file.')
}

/** Upper bound on how long one auth op may block the lock chain. */
const MAX_LOCK_HOLD_MS = 15_000

/** Extends Supabase's error so GoTrue's `instanceof LockAcquireTimeoutError` check passes. */
class InTabLockAcquireTimeoutError extends NavigatorLockAcquireTimeoutError {
  constructor(message: string) {
    super(message)
    this.name = 'InTabLockAcquireTimeoutError'
  }
}

function settleAfter(ms: number): { promise: Promise<void>; cancel: () => void } {
  let id: ReturnType<typeof setTimeout>
  const promise = new Promise<void>((resolve) => {
    id = setTimeout(resolve, ms)
  })
  return { promise, cancel: () => clearTimeout(id) }
}

/** Resolves true if `p` is already settled, false otherwise. Never throws. */
function isSettled(p: Promise<unknown>): Promise<boolean> {
  return Promise.race([
    p.then(
      () => true,
      () => true,
    ),
    Promise.resolve().then(() => false),
  ])
}

/**
 * In-tab async lock replacing Supabase's `navigator.locks` lock, which can
 * deadlock on reload in Chrome. The caller gets the true `fn()` result; the next
 * holder waits on a separate time-capped wrapper, so a hung `fn()` cannot poison
 * the chain and deadlock all future `getSession()` calls.
 */
const lockChains = new Map<string, Promise<unknown>>()

function inTabLock<R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> {
  const prev = lockChains.get(name) ?? Promise.resolve()

  const run = (async (): Promise<R> => {
    if (acquireTimeout === 0) {
      // `ifAvailable`: run only if the chain is free now, else bail.
      if (!(await isSettled(prev))) {
        throw new InTabLockAcquireTimeoutError(`In-tab lock "${name}" not immediately available`)
      }
    } else if (acquireTimeout > 0) {
      const timer = settleAfter(acquireTimeout)
      const timedOut = await Promise.race([
        prev.then(
          () => false,
          () => false,
        ),
        timer.promise.then(() => true),
      ])
      timer.cancel()
      if (timedOut) {
        throw new InTabLockAcquireTimeoutError(
          `Acquiring in-tab lock "${name}" timed out after ${acquireTimeout}ms`,
        )
      }
    } else {
      // Negative timeout: wait — bounded, since `prev` is the capped wrapper.
      await prev.then(
        () => undefined,
        () => undefined,
      )
    }
    return await fn()
  })()

  const cap = settleAfter(MAX_LOCK_HOLD_MS)
  lockChains.set(
    name,
    Promise.race([
      run.then(
        () => cap.cancel(),
        () => cap.cancel(),
      ),
      cap.promise,
    ]),
  )

  return run
}

const AUTH_FETCH_TIMEOUT_MS = 20_000

/**
 * Aborts stalled auth requests. GoTrue runs token refreshes inside its lock and
 * releases it only once the request settles; an untimed refresh `fetch` that
 * hangs after the machine sleeps would hold the lock forever and freeze all
 * later `getSession()` calls — the root cause of the idle-disconnect bug.
 */
const timeoutFetch: typeof fetch = (input, init) => {
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(new DOMException('Supabase auth request timed out', 'TimeoutError')),
    AUTH_FETCH_TIMEOUT_MS,
  )
  const upstream = init?.signal
  if (upstream) {
    if (upstream.aborted) controller.abort(upstream.reason)
    else upstream.addEventListener('abort', () => controller.abort(upstream.reason), { once: true })
  }
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

/** Shared Supabase client. Auth is the only feature used; all data goes via the backend. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: inTabLock,
  },
  global: { fetch: timeoutFetch },
})
