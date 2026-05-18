import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MCPModal } from '@/components/mcp/MCPModal'
import { useUIStore } from '@/stores/uiStore'

/** Main authenticated shell: conversation sidebar + routed content. */
export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  return (
    <div className="bg-background flex h-dvh overflow-hidden">
      <Sidebar />
      {/* Mobile-only backdrop; tapping it dismisses the overlay sidebar. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
      <MCPModal />
    </div>
  )
}
