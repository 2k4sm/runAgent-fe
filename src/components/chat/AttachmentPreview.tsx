import { Check, Loader2, TriangleAlert, X } from 'lucide-react'
import { FileIcon } from '@/components/common/FileIcon'
import { formatFileSize } from '@/lib/utils'
import type { StagedFile } from '@/types'

interface AttachmentPreviewProps {
  files: StagedFile[]
  onRemove: (localId: string) => void
}

/** Removable chips for files staged in the message input, showing upload state. */
export function AttachmentPreview({ files, onRemove }: AttachmentPreviewProps) {
  if (files.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-1 pb-2">
      {files.map((staged) => (
        <span
          key={staged.localId}
          className="border-border bg-muted flex items-center gap-1.5 border px-2 py-1 text-xs"
        >
          <FileIcon fileName={staged.file.name} fileType={staged.file.type} className="size-3.5" />
          <span className="max-w-[10rem] truncate">{staged.file.name}</span>
          <span className="text-muted-foreground">{formatFileSize(staged.file.size)}</span>

          {staged.status === 'uploading' && (
            <Loader2 className="text-muted-foreground size-3.5 animate-spin" />
          )}
          {staged.status === 'uploaded' && (
            <Check className="size-3.5 text-green-600" aria-label="Uploaded" />
          )}
          {staged.status === 'error' && (
            <TriangleAlert
              className="size-3.5 text-red-600"
              aria-label={staged.error ?? 'Upload failed'}
            />
          )}

          <button
            type="button"
            onClick={() => onRemove(staged.localId)}
            aria-label={`Remove ${staged.file.name}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
    </div>
  )
}
