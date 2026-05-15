import { Brain, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { ChatItem } from '@/types'

/** Collapsible display of an agent's internal reasoning. Collapsed by default. */
export function ThoughtBlock({ item }: { item: ChatItem }) {
  return (
    <Collapsible className="my-2">
      <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs">
        <Brain className="size-3.5" />
        <span>Thinking</span>
        <ChevronRight className="size-3 transition-transform group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="border-border text-muted-foreground mt-1 border-l-2 pl-3 text-xs whitespace-pre-wrap italic">
          {item.content}
        </p>
      </CollapsibleContent>
    </Collapsible>
  )
}
