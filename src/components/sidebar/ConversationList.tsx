import { MessagesSquare } from 'lucide-react'
import { ConversationItem } from './ConversationItem'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useConversationStore } from '@/stores/conversationStore'

export function ConversationList() {
  const conversations = useConversationStore((s) => s.conversations)
  const activeId = useConversationStore((s) => s.activeId)
  const loading = useConversationStore((s) => s.loading)

  if (loading && conversations.length === 0) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="No conversations yet"
        description="Start a new chat to begin."
      />
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="py-1">
        {conversations.map((c) => (
          <ConversationItem key={c.id} conversation={c} active={c.id === activeId} />
        ))}
      </div>
    </ScrollArea>
  )
}
