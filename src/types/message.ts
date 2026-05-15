/** A persisted message row from GET /api/v1/conversations/{id}/messages. */
export interface PersistedMessage {
  id: string
  conversation_id: string
  run_id: string | null
  role: string
  agent: string | null
  content: string | null
  metadata: Record<string, unknown>
}
