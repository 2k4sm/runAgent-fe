import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, Settings, PanelLeftClose } from 'lucide-react'
import { NewChatButton } from './NewChatButton'
import { ConversationList } from './ConversationList'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { useConversationStore } from '@/stores/conversationStore'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { Conversation } from '@/types'

export function Sidebar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const loadConversations = useConversationStore((s) => s.loadConversations)
  const deleteConversation = useConversationStore((s) => s.deleteConversation)
  const activeId = useConversationStore((s) => s.activeId)

  // Dialog lives in the stable Sidebar — not in ConversationItem, which
  // unmounts on delete and would tear the open dialog out mid-close.
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null)

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const wasActive = activeId === pendingDelete.id
    try {
      await deleteConversation(pendingDelete.id)
      if (wasActive) navigate(ROUTES.CHAT)
    } catch {
      toast.error('Could not delete conversation')
    }
  }

  const email = user?.email ?? 'Account'
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar text-sidebar-foreground flex h-full flex-col border-r',
        'transition-[width] duration-200',
        sidebarOpen ? 'w-72' : 'w-0 overflow-hidden',
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <span className="text-sm font-semibold tracking-tight">runAgent</span>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Collapse sidebar">
          <PanelLeftClose />
        </Button>
      </div>

      <div className="px-3 pb-2">
        <NewChatButton />
      </div>

      <ConversationList onRequestDelete={setPendingDelete} />

      <div className="flex items-center gap-2 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-label="Account menu"
          >
            <Avatar fallback={initials} />
            <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuLabel>{email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void signOut()}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete conversation?"
        description="This conversation and its messages will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </aside>
  )
}
