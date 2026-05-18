/** Streaming event types emitted by POST /api/v1/chat/message. */
export type SSEEventType =
  | 'chunk'
  | 'reasoning'
  | 'agent_response'
  | 'thought'
  | 'tool_call'
  | 'tool_result'
  | 'handoff'
  | 'status'
  | 'error'
  | 'done'

/** Known agent identities in the multi-agent backend. */
export type AgentName = 'supervisor' | 'research' | 'document'

export interface ToolCallMeta {
  tool_name: string
  tool_args: Record<string, unknown>
  tool_call_id: string
  /** Live favicon URL for the owning MCP server, when applicable. */
  tool_icon?: string
}

export interface ToolResultMeta {
  tool_name: string
  tool_call_id?: string
}

export interface HandoffMeta {
  target_agent: AgentName
  task: string
  /** For MCP handoffs: the connected server's name, shown in place of "Mcp". */
  server_name?: string
}

export interface UsageMeta {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface DoneMeta {
  usage: UsageMeta
}

/** A single decoded SSE frame. */
export interface SSEEvent {
  type: SSEEventType
  agent: string
  content: string | null
  metadata: Record<string, unknown> | null
  timestamp: string | null
}
