import { FileText, FileSpreadsheet, FileImage, FileType, Presentation, File } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import { fileExtension } from '@/lib/utils'

/** Picks a lucide icon for a file based on its name or MIME type. */
export function FileIcon({
  fileName,
  fileType,
  ...props
}: { fileName: string; fileType?: string } & LucideProps) {
  const ext = fileExtension(fileName)
  const mime = fileType ?? ''

  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return <FileImage {...props} />
  }
  if (mime === 'application/pdf' || ext === 'pdf') return <FileType {...props} />
  if (mime.includes('spreadsheet') || ['xlsx', 'xls', 'csv'].includes(ext)) {
    return <FileSpreadsheet {...props} />
  }
  if (mime.includes('presentation') || ['pptx', 'ppt'].includes(ext)) {
    return <Presentation {...props} />
  }
  if (
    mime.startsWith('text/') ||
    mime.includes('word') ||
    ['txt', 'md', 'doc', 'docx'].includes(ext)
  ) {
    return <FileText {...props} />
  }
  return <File {...props} />
}
