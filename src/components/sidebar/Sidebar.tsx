import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, PanelLeftClose } from 'lucide-react'
import { NewChatButton } from './NewChatButton'
import { ConversationList } from './ConversationList'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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

export function Sidebar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const loadConversations = useConversationStore((s) => s.loadConversations)

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

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

      <Separator />
      <ConversationList />
      <Separator />

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
    </aside>
  )
}
