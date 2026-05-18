import {
  FileEdit,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Globe,
  List,
  Presentation,
  Search,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

interface ToolDef {
  /** Human-friendly action label shown instead of the raw tool name. */
  label: string
  icon: LucideIcon
}

/** Per-tool display metadata, keyed by the backend tool name. */
const TOOL_DEFS: Record<string, ToolDef> = {
  tavily_search: { label: 'Web search', icon: Search },
  web_fetch: { label: 'Fetch page', icon: Globe },
  create_csv: { label: 'Create CSV', icon: FileSpreadsheet },
  create_xlsx: { label: 'Create spreadsheet', icon: FileSpreadsheet },
  create_pdf: { label: 'Create PDF', icon: FileText },
  create_docx: { label: 'Create document', icon: FileText },
  create_md: { label: 'Create Markdown', icon: FileText },
  create_txt: { label: 'Create text file', icon: FileText },
  create_pptx: { label: 'Create presentation', icon: Presentation },
  edit_document: { label: 'Edit document', icon: FileEdit },
  read_document: { label: 'Read document', icon: FileSearch },
  list_documents: { label: 'List documents', icon: List },
}

/** Title-cases a raw snake/kebab tool name as a readable fallback label. */
function prettifyName(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface ToolMeta {
  /** Fallback label, used when the model did not provide a `task_summary`. */
  label: string
  icon: LucideIcon
}

/** Resolves a tool's icon and fallback label (the heading itself comes from `task_summary`). */
export function toolMeta(toolName: string | undefined): ToolMeta {
  const def = toolName ? TOOL_DEFS[toolName] : undefined
  return {
    label: def?.label ?? prettifyName(toolName ?? 'tool'),
    icon: def?.icon ?? Wrench,
  }
}
