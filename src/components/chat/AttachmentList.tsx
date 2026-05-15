import { FileIcon } from '@/components/common/FileIcon'
import { formatFileSize } from '@/lib/utils'
import type { Asset } from '@/types'

/** Read-only chips for files attached to a user message. */
export function AttachmentList({ attachments }: { attachments: Asset[] }) {
  if (attachments.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {attachments.map((a) => {
        const chip = (
          <span className="border-border bg-background flex items-center gap-1.5 border px-2 py-1 text-xs">
            <FileIcon fileName={a.file_name} fileType={a.file_type} className="size-3.5" />
            <span className="max-w-[12rem] truncate">{a.file_name}</span>
            {a.file_size ? (
              <span className="text-muted-foreground">{formatFileSize(a.file_size)}</span>
            ) : null}
          </span>
        )
        return a.file_url ? (
          <a key={a.id} href={a.file_url} target="_blank" rel="noopener noreferrer">
            {chip}
          </a>
        ) : (
          <span key={a.id}>{chip}</span>
        )
      })}
    </div>
  )
}
