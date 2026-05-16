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

/** Lifecycle of a file staged in the composer before a message is sent. */
export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error'

/** A file selected in the composer, tracked through its upload. */
export interface StagedFile {
  /** Stable client-side id for list keys and removal. */
  localId: string
  file: File
  status: UploadStatus
  /** Set once the upload succeeds. */
  assetId?: string
  /** Set once the upload succeeds — used for an immediate preview chip. */
  asset?: Asset
  /** Set when status is 'error'. */
  error?: string
}
