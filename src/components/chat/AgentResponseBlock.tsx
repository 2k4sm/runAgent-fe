import { useEffect, useState } from 'react'
import { Bot, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Markdown } from '@/components/common/Markdown'
import { agentMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ChatItem } from '@/types'

/**
 * Collapsible block holding a worker agent's intermediate response. Keeps the
 * supervisor's final answer as the main message body while still surfacing
 * (and persisting) what each delegated agent produced.
 *
 * Auto-expands while it is the latest thing being received (`active`), then
 * collapses on its own once the next item arrives. The user can still toggle
 * it manually at any point.
 */
export function AgentResponseBlock({ item, active = false }: { item: ChatItem; active?: boolean }) {
  const meta = agentMeta(item.agent)
  const [open, setOpen] = useState(active)

  // Collapse once this is no longer the most recent item in the turn.
  useEffect(() => {
    if (!active) setOpen(false)
  }, [active])

  return (
    <Collapsible className="my-2" open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs">
        <Bot className="size-3.5" />
        <span>
          <span className={cn('rounded border px-1 py-0.5', meta.badgeClass)}>{meta.label}</span>{' '}
          response
        </span>
        <ChevronRight className="size-3 transition-transform group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-border bg-muted/50 text-muted-foreground mt-1 border-l-2 py-2 pl-3 text-sm">
          <Markdown content={item.content} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
