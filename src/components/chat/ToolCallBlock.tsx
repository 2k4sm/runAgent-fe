import { ChevronRight, Loader2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toolMeta } from '@/lib/tools'
import type { ChatItem, ToolCallMeta } from '@/types'

/** Collapsible display of a tool invocation and, once available, its result. */
export function ToolCallBlock({ item }: { item: ChatItem }) {
  const meta = (item.metadata ?? {}) as Partial<ToolCallMeta>
  const toolName = item.toolName ?? meta.tool_name
  const pending = item.kind === 'tool_call' && !item.resolved
  const args = meta.tool_args
  const result = item.kind === 'tool_result' ? item.content : item.result

  const { label, icon: Icon } = toolMeta(toolName)

  // MCP tool calls carry their server's favicon — show the real service icon.
  const toolIcon = typeof meta.tool_icon === 'string' ? meta.tool_icon : undefined

  // Show the model-provided `task_summary` as the heading; fall back to the
  // static label for older runs that lack it.
  const summary =
    typeof args?.task_summary === 'string' && args.task_summary.trim() ? args.task_summary : label

  // Don't show the display-only args twice in the raw Arguments dump.
  const displayArgs = args
    ? Object.fromEntries(
        Object.entries(args).filter(([k]) => k !== 'task_name' && k !== 'task_summary'),
      )
    : undefined

  return (
    <Collapsible className="border-border my-2 border">
      <CollapsibleTrigger className="group bg-muted/50 flex w-full items-center gap-2 px-2.5 py-1.5 text-xs">
        {pending ? (
          <Loader2 className="text-muted-foreground size-3.5 shrink-0 animate-spin" />
        ) : toolIcon ? (
          <img src={toolIcon} alt="" className="size-3.5 shrink-0 rounded-sm" />
        ) : (
          <Icon className="text-muted-foreground size-3.5 shrink-0" />
        )}
        <span className="truncate font-medium">{summary}</span>
        <span className="text-muted-foreground ml-auto shrink-0">
          {pending ? 'running…' : 'done'}
        </span>
        <ChevronRight className="size-3 shrink-0 transition-transform group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 px-2.5 py-2 text-xs">
          {displayArgs && Object.keys(displayArgs).length > 0 ? (
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Arguments</p>
              <pre className="bg-muted overflow-x-auto p-2 whitespace-pre-wrap">
                {JSON.stringify(displayArgs, null, 2)}
              </pre>
            </div>
          ) : null}
          {result ? (
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Result</p>
              <pre className="bg-muted max-h-64 overflow-auto p-2 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
