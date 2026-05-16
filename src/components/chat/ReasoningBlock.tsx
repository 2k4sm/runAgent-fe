import { Brain, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { ChatItem } from '@/types'

/**
 * Collapsible, recessed ("sunken") panel showing the model's streamed
 * reasoning tokens. Auto-expands while the turn is still streaming so the
 * tokens are visible live; the user can collapse it at any point.
 */
export function ReasoningBlock({
  item,
  streaming = false,
}: {
  item: ChatItem
  streaming?: boolean
}) {
  return (
    <Collapsible className="my-2" defaultOpen={streaming}>
      <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs">
        <Brain className="size-3.5" />
        <span>Reasoning{streaming ? '…' : ''}</span>
        <ChevronRight className="size-3 transition-transform group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-muted/50 border-border mt-1 rounded border p-3 shadow-inner">
          <p className="text-muted-foreground text-xs whitespace-pre-wrap italic">{item.content}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
