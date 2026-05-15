/** A conversation as returned by the /api/v1/conversations endpoints. */
export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}
