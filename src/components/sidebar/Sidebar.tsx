import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PanelLeftClose } from 'lucide-react'
import { NewChatButton } from './NewChatButton'
import { LogoWordmark } from '@/components/common/Logo'
import { ConversationList } from './ConversationList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useUIStore } from '@/stores/uiStore'
import { useConversationStore } from '@/stores/conversationStore'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { Conversation } from '@/types'

export function Sidebar() {
  const navigate = useNavigate()
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

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar text-sidebar-foreground flex h-full flex-col border-r',
        // Mobile: fixed overlay that slides in over the page content.
        // Kept below z-50 so portalled menus/dialogs layer above it.
        'fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: in-flow column that collapses by width.
        'md:static md:z-auto md:translate-x-0 md:transition-[width]',
        sidebarOpen ? 'md:w-72' : 'md:w-0 md:overflow-hidden',
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <LogoWordmark markClassName="size-6" />
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Collapse sidebar">
          <PanelLeftClose />
        </Button>
      </div>

      <div className="px-3 pb-2">
        <NewChatButton />
      </div>

      <ConversationList onRequestDelete={setPendingDelete} />

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
