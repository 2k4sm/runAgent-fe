import { PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useUIStore } from '@/stores/uiStore'

/** Slim top bar for the chat area; reveals the sidebar toggle when collapsed. */
export function Header({ title }: { title: string }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <header className="border-border flex h-12 shrink-0 items-center gap-2 border-b px-3">
      {!sidebarOpen && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open sidebar">
          <PanelLeftOpen />
        </Button>
      )}
      <h1 className="flex-1 truncate text-sm font-medium">{title}</h1>
      <ThemeToggle />
    </header>
  )
}
