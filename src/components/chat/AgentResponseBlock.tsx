import { Bot, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Markdown } from '@/components/common/Markdown'
import { agentMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ChatItem } from '@/types'

/**
 * Collapsible block holding a worker agent's intermediate response. Keeps the
 * supervisor's final answer as the main message body while still surfacing
 * (and persisting) what each delegated agent produced. Collapsed by default.
 */
export function AgentResponseBlock({ item }: { item: ChatItem }) {
  const meta = agentMeta(item.agent)

  return (
    <Collapsible className="my-2">
      <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs">
        <Bot className="size-3.5" />
        <span>
          <span className={cn('rounded border px-1 py-0.5', meta.badgeClass)}>{meta.label}</span>{' '}
          response
        </span>
        <ChevronRight className="size-3 transition-transform group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-muted/50 border-border mt-1 rounded border p-3 text-sm shadow-inner">
          <Markdown content={item.content} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
