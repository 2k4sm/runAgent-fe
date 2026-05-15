/** An asset (uploaded attachment or agent-generated file) from /api/v1/files. */
export interface Asset {
  id: string
  user_id: string
  conversation_id: string | null
  run_id: string | null
  source: 'upload' | 'generated' | string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  file_url: string
  created_at: string
}
