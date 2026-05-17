import { PanelLeftOpen, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
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
import { ROUTES } from '@/lib/constants'

/** Slim top bar for the chat area; reveals the sidebar toggle when collapsed. */
export function Header({ title }: { title: string }) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const email = user?.email ?? 'Account'
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <header className="border-border flex h-12 shrink-0 items-center gap-2 border-b px-3">
      {!sidebarOpen && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open sidebar">
          <PanelLeftOpen />
        </Button>
      )}
      <h1 className="flex-1 truncate text-sm font-medium">{title}</h1>

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Account menu">
          <Avatar fallback={initials} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
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
    </header>
  )
}
