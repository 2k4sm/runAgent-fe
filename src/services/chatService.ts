import { API_BASE_URL } from '@/lib/constants'
import { ApiError, getAuthToken } from './api'
import type { ApiErrorBody } from '@/types'

export interface SendMessageParams {
  content: string
  conversationId: string
  /** Ids of assets already uploaded via fileService.upload. */
  attachmentIds?: string[]
  /** Request the model to stream its reasoning/thinking tokens. */
  reasoning?: boolean
  signal?: AbortSignal
}

/**
 * Posts a chat message and returns the raw streaming Response.
 *
 * Attachments are uploaded separately beforehand; this request only carries
 * their ids. Uses `fetch` directly (not the JSON `api` wrapper) so the
 * response body stays an unconsumed SSE stream for the caller to read. Throws
 * ApiError before any streaming begins if the request is rejected.
 */
export const chatService = {
  async sendMessage({
    content,
    conversationId,
    attachmentIds,
    reasoning,
    signal,
  }: SendMessageParams): Promise<Response> {
    const token = await getAuthToken()

    const res = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        content,
        conversation_id: conversationId,
        attachment_ids: attachmentIds ?? [],
        reasoning: reasoning ?? false,
      }),
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
