import { ChevronRight, Loader2, Wrench } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { ChatItem, ToolCallMeta } from '@/types'

/** Collapsible display of a tool invocation and, once available, its result. */
export function ToolCallBlock({ item }: { item: ChatItem }) {
  const meta = (item.metadata ?? {}) as Partial<ToolCallMeta>
  const toolName = item.toolName ?? meta.tool_name ?? 'tool'
  const pending = item.kind === 'tool_call' && !item.resolved
  const args = meta.tool_args
  const result = item.kind === 'tool_result' ? item.content : item.result

  return (
    <Collapsible className="border-border my-2 border">
      <CollapsibleTrigger className="group bg-muted/50 flex w-full items-center gap-2 px-2.5 py-1.5 text-xs">
        {pending ? (
          <Loader2 className="text-muted-foreground size-3.5 animate-spin" />
        ) : (
          <Wrench className="text-muted-foreground size-3.5" />
        )}
        <span className="font-medium">{toolName}</span>
        <span className="text-muted-foreground">{pending ? 'running…' : 'done'}</span>
        <ChevronRight className="ml-auto size-3 transition-transform group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 px-2.5 py-2 text-xs">
          {args && Object.keys(args).length > 0 ? (
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Arguments</p>
              <pre className="bg-muted overflow-x-auto p-2 whitespace-pre-wrap">
                {JSON.stringify(args, null, 2)}
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
