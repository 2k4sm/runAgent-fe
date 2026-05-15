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

/** Returns a fresh access token, refreshing the session if necessary. */
export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
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

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    })
  }

  let token = auth ? await getAuthToken() : null
  let res = await doFetch(token)

  // One transparent retry on 401 after attempting a session refresh.
  if (res.status === 401 && auth) {
    const { data } = await supabase.auth.refreshSession()
    token = data.session?.access_token ?? null
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
