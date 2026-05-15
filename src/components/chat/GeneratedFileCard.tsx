import { Download } from 'lucide-react'
import { FileIcon } from '@/components/common/FileIcon'
import { formatFileSize } from '@/lib/utils'
import type { Asset } from '@/types'

/** Download card for a file produced by the document agent. */
export function GeneratedFileCard({ asset }: { asset: Asset }) {
  return (
    <a
      href={asset.file_url}
      download={asset.file_name}
      target="_blank"
      rel="noopener noreferrer"
      className="group border-border bg-card hover:bg-accent flex items-center gap-3 border p-3 transition-colors"
    >
      <FileIcon
        fileName={asset.file_name}
        fileType={asset.file_type}
        className="text-primary size-7 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{asset.file_name}</p>
        <p className="text-muted-foreground text-xs">{formatFileSize(asset.file_size)}</p>
      </div>
      <Download className="text-muted-foreground group-hover:text-foreground size-4 shrink-0" />
    </a>
  )
}
