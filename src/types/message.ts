import type { SSEEventType } from './sse'

/** A trimmed attachment record embedded in a user message timeline entry. */
export interface TimelineAttachment {
  id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
}

/**
 * One entry in a run's ordered `data` timeline — either a message
 * (`kind: 'message'`) or a streamed event (`kind: 'event'`).
 */
export interface TimelineEntry {
  kind: 'message' | 'event'
  ts: string
  // message entries
  role?: 'user' | 'assistant'
  attachments?: TimelineAttachment[]
  // event entries
  type?: SSEEventType
  // shared
  agent?: string | null
  content?: string | null
  metadata?: Record<string, unknown> | null
}

/**
 * A persisted run from GET /api/v1/conversations/{id}/runs. One run is a
 * single cycle: user message + events + assistant message.
 */
export interface PersistedRun {
  id: string
  conversation_id: string
  status: string
  model: string | null
  prompt_tokens: number
  completion_tokens: number
  error: string | null
  data: TimelineEntry[]
  created_at: string
  completed_at: string | null
}
