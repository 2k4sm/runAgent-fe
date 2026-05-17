import { supabase } from '@/lib/supabase'
import { API_BASE_URL, AUTH_LOGOUT_EVENT } from '@/lib/constants'
import type { ApiErrorBody } from '@/types'

/** Typed error thrown for any non-2xx backend response. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  get isRateLimited(): boolean {
    return this.status === 429
  }
}

/** Max time to wait for `getSession()` before falling back to the last token. */
const GET_SESSION_TIMEOUT_MS = 5_000

let lastKnownToken: string | null = null

/**
 * Returns a fresh access token. Caps the wait on `getSession()` and falls back
 * to the last-known token if the auth lock stalls, so an idle tab keeps issuing
 * requests; an expired fallback 401s and is recovered by `request()`'s retry.
 */
export async function getAuthToken(): Promise<string | null> {
  const timeout = new Promise<'timeout'>((resolve) =>
    setTimeout(() => resolve('timeout'), GET_SESSION_TIMEOUT_MS),
  )
  try {
    const result = await Promise.race([supabase.auth.getSession(), timeout])
    if (result === 'timeout') {
      console.warn('getAuthToken: getSession() timed out — using last-known token')
      return lastKnownToken
    }
    const token = result.data.session?.access_token ?? null
    if (token) lastKnownToken = token
    return token
  } catch (err) {
    console.warn('getAuthToken: getSession() failed — using last-known token', err)
    return lastKnownToken
  }
}

function dispatchLogout(): void {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
}

async function parseError(res: Response): Promise<ApiError> {
  let detail = res.statusText || 'Request failed'
  try {
    const body = (await res.json()) as ApiErrorBody
    if (body?.detail) detail = body.detail
  } catch {
    /* non-JSON error body — keep the status text */
  }
  if (res.status === 429) detail = 'Rate limit exceeded — please wait a moment and try again.'
  return new ApiError(res.status, detail)
}

interface RequestOptions {
  method?: string
  /** JSON-serialisable body, or a FormData instance for multipart requests. */
  body?: unknown
  signal?: AbortSignal
  /** Set false to skip the Authorization header (unused today; all routes need auth). */
  auth?: boolean
}

/** Max time a single backend JSON request may take before being aborted. */
const REQUEST_TIMEOUT_MS = 30_000

/**
 * Core fetch wrapper: attaches a fresh Supabase JWT, prefixes the API base URL,
 * retries once on 401 after refreshing the session, and throws ApiError on failure.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, auth = true } = options
  const isForm = body instanceof FormData

  const doFetch = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {}
    if (auth && token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

    // Bound the request: fetchMe() runs inside the Supabase auth lock, so a
    // hung backend call must not stall forever.
    const controller = new AbortController()
    const timer = setTimeout(
      () => controller.abort(new DOMException('Request timed out', 'TimeoutError')),
      REQUEST_TIMEOUT_MS,
    )
    if (signal) {
      if (signal.aborted) controller.abort(signal.reason)
      else signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
    }
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }
  }

  let token = auth ? await getAuthToken() : null
  let res = await doFetch(token)

  // One transparent retry on 401 after a bounded session refresh.
  if (res.status === 401 && auth) {
    const refreshTimeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), GET_SESSION_TIMEOUT_MS),
    )
    token = await Promise.race([
      supabase.auth.refreshSession().then(
        ({ data }) => data.session?.access_token ?? null,
        () => null,
      ),
      refreshTimeout,
    ])
    if (token) {
      res = await doFetch(token)
    }
    if (res.status === 401) {
      dispatchLogout()
      throw new ApiError(401, 'Your session has expired. Please sign in again.')
    }
  }

  if (!res.ok) throw await parseError(res)

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const apiGet = <T>(path: string, signal?: AbortSignal) =>
  request<T>(path, { method: 'GET', signal })

export const apiPost = <T>(path: string, body?: unknown, signal?: AbortSignal) =>
  request<T>(path, { method: 'POST', body, signal })

export const apiDelete = <T>(path: string, signal?: AbortSignal) =>
  request<T>(path, { method: 'DELETE', signal })
