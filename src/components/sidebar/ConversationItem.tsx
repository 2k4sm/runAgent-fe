import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useConversationStore } from '@/stores/conversationStore'
import { cn, formatRelativeTime } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { Conversation } from '@/types'

interface ConversationItemProps {
  conversation: Conversation
  active: boolean
}

export function ConversationItem({ conversation, active }: ConversationItemProps) {
  const navigate = useNavigate()
  const selectConversation = useConversationStore((s) => s.selectConversation)
  const deleteConversation = useConversationStore((s) => s.deleteConversation)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const open = () => {
    selectConversation(conversation.id)
    navigate(ROUTES.CHAT_BY_ID(conversation.id))
  }

  const handleDelete = async () => {
    try {
      await deleteConversation(conversation.id)
      if (active) navigate(ROUTES.CHAT)
    } catch {
      toast.error('Could not delete conversation')
    }
  }

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-2 text-sm transition-colors',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'hover:bg-sidebar-accent/60',
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
              'hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100',
              'data-[popup-open]:opacity-100',
            )}
            aria-label="Conversation options"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem destructive onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete conversation?"
        description="This conversation and its messages will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  )
}
