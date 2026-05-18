import type { Asset } from './file'
import type { UsageMeta } from './sse'

export type ChatRole = 'user' | 'assistant'

/** Kinds of inline items that interleave within an assistant turn. */
export type ChatItemKind =
  | 'reasoning'
  | 'agent_response'
  | 'tool_call'
  | 'tool_result'
  | 'handoff'
  | 'error'

/** A reasoning step, tool call, handoff, or error rendered inside an assistant message. */
export interface ChatItem {
  id: string
  kind: ChatItemKind
  agent?: string
  content: string
  metadata?: Record<string, unknown>
  /** For tool_call items: the originating tool call id, used to attach a result. */
  toolCallId?: string
  toolName?: string
  /** For tool_call items once resolved: the matched tool_result text. */
  result?: string
  resolved?: boolean
}

export type ChatMessageStatus = 'streaming' | 'complete' | 'error'

/** The UI's runtime model for one message (user or assistant). */
export interface ChatMessage {
  id: string
  role: ChatRole
  agent?: string
  /** Assistant: accumulated text chunks. User: the typed message. */
  content: string
  /** Thoughts, tool calls/results, handoffs, errors interleaved (assistant only). */
  items: ChatItem[]
  /** Files the user attached to this message. */
  attachments?: Asset[]
  /** Files surfaced as generated assets after reconciliation. */
  generatedAssets?: Asset[]
  status: ChatMessageStatus
  usage?: UsageMeta
  runId?: string | null
  createdAt: string
}
