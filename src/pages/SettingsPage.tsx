import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="text-muted-foreground text-sm">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  return (
    <div className="flex h-full flex-col">
      <Header title="Settings" />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-6">
        <section className="border-border bg-card border p-5">
          <h2 className="text-sm font-semibold">Account</h2>
          <Separator className="my-2" />
          <Row label="Email">{user?.email ?? '—'}</Row>
          <Separator />
          <Row label="Role">{user?.role ?? '—'}</Row>
          <Separator />
          <Row label="User ID">
            <span className="font-mono text-xs">{user?.id ?? '—'}</span>
          </Row>
        </section>

        <section className="border-border bg-card mt-6 border p-5">
          <h2 className="text-sm font-semibold">Appearance</h2>
          <Separator className="my-2" />
          <Row label="Theme">
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? 'Dark' : 'Light'}
            </Button>
          </Row>
        </section>

        <div className="mt-6">
          <Button variant="destructive" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
