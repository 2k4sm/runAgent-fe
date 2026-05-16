import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConversationStore } from '@/stores/conversationStore'
import { cn, formatRelativeTime } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { Conversation } from '@/types'

interface ConversationItemProps {
  conversation: Conversation
  active: boolean
  onRequestDelete: (conversation: Conversation) => void
}

export function ConversationItem({ conversation, active, onRequestDelete }: ConversationItemProps) {
  const navigate = useNavigate()
  const selectConversation = useConversationStore((s) => s.selectConversation)

  const open = () => {
    selectConversation(conversation.id)
    navigate(ROUTES.CHAT_BY_ID(conversation.id))
  }

  return (
    <div
      className={cn(
        'group border-sidebar-border/60 flex items-center gap-1 border-b px-2 py-2 text-sm transition-colors last:border-b-0',
        active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/60',
      )}
    >
      <button
        type="button"
        onClick={open}
        className="min-w-0 flex-1 text-left"
        title={conversation.title}
      >
        <p className="truncate">{conversation.title}</p>
        <p className="text-muted-foreground truncate text-xs">
          {formatRelativeTime(conversation.updated_at)}
        </p>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'text-muted-foreground inline-flex size-7 shrink-0 items-center justify-center',
            'hover:text-foreground transition-colors',
          )}
          aria-label="Conversation options"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* Defer so the menu starts closing before the dialog opens. */}
          <DropdownMenuItem
            destructive
            onClick={() => requestAnimationFrame(() => onRequestDelete(conversation))}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
