import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Logo } from '@/components/common/Logo'

/** Centered card shell for the login and signup pages. */
export function AuthLayout() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="size-12" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">runAgent</h1>
          <p className="text-muted-foreground mt-1 text-sm">Agentic assistant</p>
        </div>
        <div className="border-border bg-card text-card-foreground border p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
