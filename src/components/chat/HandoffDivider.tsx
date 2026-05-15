import { ArrowRight } from 'lucide-react'
import { agentMeta } from '@/lib/constants'
import type { ChatItem, HandoffMeta } from '@/types'

/** Divider marking the supervisor routing work to a specialist agent. */
export function HandoffDivider({ item }: { item: ChatItem }) {
  const meta = (item.metadata ?? {}) as Partial<HandoffMeta>
  const target = agentMeta(meta.target_agent)

  return (
    <div className="text-muted-foreground my-3 flex items-center gap-2 text-xs">
      <div className="bg-border h-px flex-1" />
      <ArrowRight className="size-3" />
      <span>
        Routing to <span className="text-foreground font-medium">{target.label}</span>
        {meta.task ? ` — ${meta.task}` : ''}
      </span>
      <div className="bg-border h-px flex-1" />
    </div>
  )
}
