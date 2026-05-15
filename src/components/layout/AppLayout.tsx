import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar/Sidebar'

/** Main authenticated shell: conversation sidebar + routed content. */
export function AppLayout() {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
