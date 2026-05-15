import { Outlet } from 'react-router-dom'

/** Centered card shell for the login and signup pages. */
export function AuthLayout() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">runAgent</h1>
          <p className="text-muted-foreground mt-1 text-sm">Multi-agent assistant</p>
        </div>
        <div className="border-border bg-card text-card-foreground border p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
