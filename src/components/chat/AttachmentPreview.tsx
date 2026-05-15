import { X } from 'lucide-react'
import { FileIcon } from '@/components/common/FileIcon'
import { formatFileSize } from '@/lib/utils'

interface AttachmentPreviewProps {
  files: File[]
  onRemove: (index: number) => void
}

/** Removable chips for files staged in the message input. */
export function AttachmentPreview({ files, onRemove }: AttachmentPreviewProps) {
  if (files.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-1 pb-2">
      {files.map((file, i) => (
        <span
          key={`${file.name}-${i}`}
          className="border-border bg-muted flex items-center gap-1.5 border px-2 py-1 text-xs"
        >
          <FileIcon fileName={file.name} fileType={file.type} className="size-3.5" />
          <span className="max-w-[10rem] truncate">{file.name}</span>
          <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${file.name}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
    </div>
  )
}
