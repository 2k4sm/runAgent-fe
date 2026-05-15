import { API_BASE_URL } from '@/lib/constants'
import { ApiError, getAuthToken } from './api'
import type { ApiErrorBody } from '@/types'

export interface SendMessageParams {
  content: string
  conversationId: string
  attachments?: File[]
  signal?: AbortSignal
}

/**
 * Posts a chat message and returns the raw streaming Response.
 *
 * Uses `fetch` directly (not the JSON `api` wrapper) so the response body stays
 * an unconsumed SSE stream for the caller to read. Throws ApiError before any
 * streaming begins if the request is rejected (e.g. 429 rate limit).
 */
export const chatService = {
  async sendMessage({
    content,
    conversationId,
    attachments,
    signal,
  }: SendMessageParams): Promise<Response> {
    const token = await getAuthToken()

    const form = new FormData()
    form.append('content', content)
    form.append('conversation_id', conversationId)
    for (const file of attachments ?? []) {
      form.append('attachments', file)
    }

    const res = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'text/event-stream',
      },
      body: form,
      signal,
    })

    if (!res.ok || !res.body) {
      let detail = res.statusText || 'Failed to send message'
      try {
        const body = (await res.json()) as ApiErrorBody
        if (body?.detail) detail = body.detail
      } catch {
        /* keep status text */
      }
      if (res.status === 429) {
        detail = 'Rate limit exceeded — please wait a moment and try again.'
      }
      throw new ApiError(res.status || 500, detail)
    }

    return res
  },
}
